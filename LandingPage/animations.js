function addHoverAnimation(elementId, images, imageElementId) {
    let hoverTimer;
    let currentIndex = 2;

    document.getElementById(elementId).addEventListener("mouseover", function() {
        hoverTimer = setInterval(changeImage, 500);
        document.getElementById(imageElementId).src = images[1];
    });

    document.getElementById(elementId).addEventListener("mouseout", function() {
        clearInterval(hoverTimer);
        document.getElementById(imageElementId).src = images[0];
        currentIndex = 2;
    });

    function changeImage() {
        let img = document.getElementById(imageElementId);
        img.src = images[currentIndex];
        currentIndex = (currentIndex + 1) % images.length;
    }
}
//Animation für Lineare Gleichungssysteme
addHoverAnimation("LGS", ["../pictures/LoesungLinearerGleichungssystemeLogo.png", "../pictures/LoesungLinearerGleichungssystemeLogo2.png", "../pictures/LoesungLinearerGleichungssystemeLogo3.png", "../pictures/LoesungLinearerGleichungssystemeLogo4.png", "../pictures/LoesungLinearerGleichungssystemeLogo5.png", "../pictures/LoesungLinearerGleichungssystemeLogo6.png"], "lgsImage");
//Animation für Numerische Integration
addHoverAnimation("Integration", ["../pictures/IntegrationLogo0.png", "../pictures/IntegrationLogo1.png", "../pictures/IntegrationLogo2.png", "../pictures/IntegrationLogo3.png", "../pictures/IntegrationLogo4.png"], "integrationImage");
