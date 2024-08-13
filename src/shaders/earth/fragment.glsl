varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

uniform sampler2D uDayTexture;
uniform sampler2D uNightTexture;
uniform sampler2D uSpecularCloudTexture;
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

    float dayMix=smoothstep(-0.25,0.5,sunOrientation);

    dayMix=clamp(dayMix,0.0,1.0);

    vec3 nightColor=texture2D(uNightTexture,vUv).xyz;
    vec3 dayColor=texture2D(uDayTexture,vUv).xyz;

    color=mix(nightColor,dayColor,dayMix);

    vec2 specularCloudColor=texture2D(uSpecularCloudTexture,vUv).rg;

    //cloud 
    float cloudMix=smoothstep(0.5,1.0,specularCloudColor.g);

    cloudMix*=dayMix;
    
    color=mix(color,vec3(1.0),cloudMix);

    // atmosphere

    float atmosphereDayMix=smoothstep(-0.5,1.0,sunOrientation);

    vec3 atmosphereColor=mix(uAtmosphereTwilightColor,uAtmosphereDayColor,atmosphereDayMix);

    // fresnel
    float fresnel=pow(1.0+dot(normal,viewDirection),2.0);

    color=mix(color,atmosphereColor,fresnel*atmosphereDayMix);

    vec3 reflection=reflect(-sunDirection,normal);

    float specular=-dot(reflection,viewDirection);

    specular=max(specular,0.0);

    specular=pow(specular,32.0);

    specular*=specularCloudColor.r;

    vec3 specularColor=mix(vec3(1.0),atmosphereColor,fresnel);

    color+=specularColor*specular;

    
    gl_FragColor = vec4(color, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}



