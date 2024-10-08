varying vec3 vNormal;
varying vec3 vPosition;

uniform vec3 uSunDirection;
uniform vec3 uAtmosphereTwilightColor;
uniform vec3 uAtmosphereDayColor;

void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = vec3(0.0);


    vec3 sunDirection=vec3(0.0,0.0,1.0);
    sunDirection=uSunDirection;
    float sunOrientation=dot(sunDirection,normal);

    // atmosphere

    float atmosphereDayMix=smoothstep(-0.5,1.0,sunOrientation);

    vec3 atmosphereColor=mix(uAtmosphereTwilightColor,uAtmosphereDayColor,atmosphereDayMix);
    color=mix(color,atmosphereColor,atmosphereDayMix);

    color+=atmosphereColor;

    float edgeAlpha=dot(normal,viewDirection);

    edgeAlpha=smoothstep(0.0,0.5,edgeAlpha);

    float dayAlpha=smoothstep(-0.5,0.0,sunOrientation);

    edgeAlpha*=dayAlpha;

    
    gl_FragColor = vec4(color, edgeAlpha);


    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}



