
function loadOBJ(renderer, path, name) {

	const manager = new THREE.LoadingManager();
	manager.onProgress = function (item, loaded, total) {
		console.log(item, loaded, total);
	};

	function onProgress(xhr) {
		if (xhr.lengthComputable) {
			const percentComplete = xhr.loaded / xhr.total * 100;
			console.log('model ' + Math.round(percentComplete, 2) + '% downloaded');
		}
	}
	function onError() { }

	new THREE.MTLLoader(manager)
		.setPath(path)
		.load(name + '.mtl', function (materials) {
			materials.preload();
			new THREE.OBJLoader(manager)
				.setMaterials(materials)
				.setPath(path)
				.load(name + '.obj', function (object) {
					object.traverse(function (child) {
						if (child.isMesh) {
							let geo = child.geometry;
							let mat;
							if (Array.isArray(child.material)) mat = child.material[0];
							else mat = child.material;

							var indices = Array.from({ length: geo.attributes.position.count }, (v, k) => k);
							let mesh = new Mesh({ name: 'aVertexPosition', array: geo.attributes.position.array },
								{ name: 'aNormalPosition', array: geo.attributes.normal.array },
								{ name: 'aTextureCoord', array: geo.attributes.uv.array },
								indices);

							let colorMap = null;
							if (mat.map != null) colorMap = new Texture(renderer.gl, mat.map.image);

							let myMaterial;
							let textureSample = 0;

							if (false) {
								if (colorMap != null) {
									textureSample = 1;
									myMaterial = new Material({
										'uSampler': { type: 'texture', value: colorMap },
										'uTextureSample': { type: '1i', value: textureSample },
										'uKd': { type: '3fv', value: mat.color.toArray() }
									}, [], VertexShader, FragmentShader);
								} else {
									myMaterial = new Material({
										'uTextureSample': { type: '1i', value: textureSample },
										'uKd': { type: '3fv', value: mat.color.toArray() }
									}, [], VertexShader, FragmentShader);
								}
							} else {
								// if (colorMap != null) {
								// 	textureSample = 1;
								// 	myMaterial = new Material({
								// 		'uSampler': { type: 'texture', value: colorMap },
								// 		'uTextureSample': { type: '1i', value: textureSample },
								// 		'uKd': { type: '3fv', value: mat.color.toArray() },
								// 		'uKs': { type: '3fv', value: mat.specular.toArray() },
								// 		'uLightIntensity ': { type: '1f', value: renderer.lights[0].entity.mat.intensity }
								// 	}, [], PhongVertexShader, PhongFragmentShader);
								// } else {
								// 	myMaterial = new Material({
								// 		'uTextureSample': { type: '1i', value: textureSample },
								// 		'uKd': { type: '3fv', value: mat.color.toArray() },
								// 		'uKs': { type: '3fv', value: mat.specular.toArray() },
								// 		'uLightIntensity ': { type: '1f', value: renderer.lights[0].entity.mat.intensity }
								// 	}, [], PhongVertexShader, PhongFragmentShader);
								// }
								myMaterial = new PhongMaterial(
									mat.color.toArray(), 
									colorMap, 
									mat.specular.toArray(), 
									renderer.lights[0].entity.mat.intensity);
							}

							let meshRender = new MeshRender(renderer.gl, mesh, myMaterial);
							renderer.addMesh(meshRender);
						}
					});
				}, onProgress, onError);
		});
}
