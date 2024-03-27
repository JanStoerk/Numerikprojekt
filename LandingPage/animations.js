let hoverTimer;
    document.getElementById("LGS").addEventListener("mouseover", function() {
        hoverTimer = setInterval(changeImage, 1000);
    });
    document.getElementById("LGS").addEventListener("mouseout", function() {
        clearInterval(hoverTimer);
        document.getElementById('lgsImage').src = "../pictures/LoesungLinearerGleichungssystemeLogo.png";
        currentIndex = 0;
    });
    let images = ["../pictures/LoesungLinearerGleichungssystemeLogo2.png", "../pictures/LoesungLinearerGleichungssystemeLogo3.png", "../pictures/LoesungLinearerGleichungssystemeLogo.png"]; // Array mit den Bilddateipfaden
    let currentIndex = 0;

    function changeImage() {
        let img = document.getElementById('lgsImage');
        img.src = images[currentIndex];
        currentIndex = (currentIndex + 1) % images.length; 
    }