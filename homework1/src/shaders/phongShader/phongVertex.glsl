attribute vec3 aVertexPosition;
attribute vec3 aNormalPosition;
attribute vec2 aTextureCoord;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uLightMVP;

varying highp vec2 vTextureCoord;
varying highp vec3 vFragPos;
varying highp vec3 vNormal;
varying highp vec4 vPositionFromLight;

// TODO : add multi light support
// #define MAX_LIGHT_COUNT 16
// uniform int lightCount
// uniform mat4 uLightMVP[MAX_LIGHT_COUNT]
// varying highp vec4 vPositionFromLight[MAX_LIGHT_COUNT];

void main(void) {
    vFragPos = (uModelMatrix * vec4(aVertexPosition, 1.0)).xyz;
    vNormal = (uModelMatrix * vec4(aNormalPosition, 0.0)).xyz;

    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aVertexPosition, 1.0);

    vTextureCoord = aTextureCoord;
    vPositionFromLight = uLightMVP * vec4(aVertexPosition, 1.0);
}