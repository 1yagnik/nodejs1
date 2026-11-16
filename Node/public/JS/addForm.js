
const imageInput = document.getElementById('imageFiles')

let chosenFiles = [];

imageInput.addEventListener("change", async () => {
    const newFiles = Array.from(imageInput.files);
    console.log(newFiles);
    
    
    for(const file of newFiles){

        if (!chosenFiles.some(
    existing => existing.name === file.name &&
                existing.size === file.size
)) {
    chosenFiles.push(file);

    const imagePath = 'images/' + file.name;

    // Live image preview
    const imagePreview = document.createElement('div');
    imagePreview.classList.add('image-preview');

    imagePreview.innerHTML = `
        <img src="${URL.createObjectURL(file)}" alt="Preview">

        <input type="hidden"
               name="imagePath"
               value="${imagePath}">

        <button type="button" class="remove">
            Remove
        </button>
    `;

    document.querySelector('.image-gallery')
        .appendChild(imagePreview);

    // Remove image
    imagePreview.querySelector('.remove').addEventListener('click', () => {
        chosenFiles = chosenFiles.filter(
            existing => existing !== file
        );

        URL.revokeObjectURL(
            imagePreview.querySelector('img').src
        );

        imagePreview.remove();
    });
}

    }
    

})






document.querySelectorAll('.remove').forEach(button => {

    button.addEventListener('click', function () {

        const imagePreview = this.closest('.image-preview');

        imagePreview.remove();

    });

});