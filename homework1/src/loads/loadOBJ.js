function loadOBJ(renderer, path, name, objMaterial, transform) {

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

	const loader = new THREE.MTLLoader(manager);
	loader.setPath(path);
	loader.load(name + '.mtl', function (materials) {
		console.log(materials);
		materials.preload();
		const objLoader = new THREE.OBJLoader(manager);
		objLoader.setMaterials(materials);
		objLoader.setPath(path);
		objLoader.load(name + '.obj', function (object) {
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
						indices, transform);

					let colorMap = new Texture();
					if (mat.map != null) {
						colorMap.CreateImageTexture(renderer.gl, mat.map.image);
					}
					else {
						colorMap.CreateConstantTexture(renderer.gl, mat.color.toArray());
					}

					let material, shadowMaterial;
					let Translation = [transform.modelTransX, transform.modelTransY, transform.modelTransZ];
					let Scale = [transform.modelScaleX, transform.modelScaleY, transform.modelScaleZ];

					let light = renderer.lights[0].entity;
					switch (objMaterial) {
						case 'PhongMaterial':
							material = buildPhongMaterial(colorMap, mat.specular.toArray(), light, Translation, Scale, "./src/shaders/phongShader/phongVertex.glsl", "./src/shaders/phongShader/phongFragment.glsl");
							shadowMaterial = buildShadowMaterial(light, Translation, Scale, "./src/shaders/shadowShader/shadowVertex.glsl", "./src/shaders/shadowShader/shadowFragment.glsl");
							break;
					}

					material.then((data) => {
						let meshRender = new MeshRender(renderer.gl, mesh, data);
						renderer.addMeshRender(meshRender);
					});
					shadowMaterial.then((data) => {
						let shadowMeshRender = new MeshRender(renderer.gl, mesh, data);
						renderer.addShadowMeshRender(shadowMeshRender);
					});
				}
				console.log('finish load mesh:', child);
			});
		}, onProgress, onError);
	});
	console.log('finish load obj:', name);
}
