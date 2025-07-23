<<<<<<< HEAD
const passContainers = document.querySelectorAll(".pass");

passContainers.forEach(container => {
    const button = container.querySelector("button");
    const input = container.querySelector("input");
    const icon = container.querySelector("button > i");

    button.addEventListener("click", () => {
        const type = input.type;

        input.type = type === "text" ? "password" : "text";
        icon.className = type === "text" ? "fa-regular fa-eye" : "fa-regular fa-eye-slash";
    });
});

function confirmPasswordChange() {
    document.getElementById("confirmModal").style.display = "block";
    return false; 
}

function closeConfirmDialog() {
    document.getElementById("confirmModal").style.display = "none";
}

function confirmAction() {
    document.querySelector("form").submit(); 
}

let deleteLink; // Variable to store the delete link

function showDeleteDialog(link) {
    deleteLink = link; 
    document.getElementById('deleteModal').style.display = 'block'; 
}

function confirmDelete() {
    window.location.href = deleteLink.href; 
}

function closeDeleteDialog() {
    document.getElementById('deleteModal').style.display = 'none'; 
}


setTimeout(function () {
    const messageElement = document.getElementById('success-message');
    if (messageElement) {
        messageElement.style.opacity = '0';
        setTimeout(() => messageElement.style.display = 'none', 500); // Ensure it disappears after fade out
    }
    document.getElementById("popup").style.display = "none";
}, 1000);

function showCaption(){
    let img=document.getElementById("img");
    let caption=document.getElementById("cap");
    if(img){
        caption.style.display="block";
    }
}

document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll('.like-link').forEach(function(link) {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            var postId = this.getAttribute('data-post-id');
            document.getElementById('likesPopup-' + postId).style.display = 'block';
        });
    });

    document.querySelectorAll('.close').forEach(function(closeBtn) {
        closeBtn.addEventListener('click', function() {
            this.closest('.likes-popup').style.display = 'none';
        });
    });
});
=======
const passContainers = document.querySelectorAll(".pass");

passContainers.forEach(container => {
    const button = container.querySelector("button");
    const input = container.querySelector("input");
    const icon = container.querySelector("button > i");

    button.addEventListener("click", () => {
        const type = input.type;

        input.type = type === "text" ? "password" : "text";
        icon.className = type === "text" ? "fa-regular fa-eye" : "fa-regular fa-eye-slash";
    });
});

function confirmPasswordChange() {
    document.getElementById("confirmModal").style.display = "block";
    return false; 
}

function closeConfirmDialog() {
    document.getElementById("confirmModal").style.display = "none";
}

function confirmAction() {
    document.querySelector("form").submit(); 
}

let deleteLink; // Variable to store the delete link

function showDeleteDialog(link) {
    deleteLink = link; 
    document.getElementById('deleteModal').style.display = 'block'; 
}

function confirmDelete() {
    window.location.href = deleteLink.href; 
}

function closeDeleteDialog() {
    document.getElementById('deleteModal').style.display = 'none'; 
}


setTimeout(function () {
    const messageElement = document.getElementById('success-message');
    if (messageElement) {
        messageElement.style.opacity = '0';
        setTimeout(() => messageElement.style.display = 'none', 500); // Ensure it disappears after fade out
    }
    document.getElementById("popup").style.display = "none";
}, 1000);

function showCaption(){
    let img=document.getElementById("img");
    let caption=document.getElementById("cap");
    if(img){
        caption.style.display="block";
    }
}

document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll('.like-link').forEach(function(link) {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            var postId = this.getAttribute('data-post-id');
            document.getElementById('likesPopup-' + postId).style.display = 'block';
        });
    });

    document.querySelectorAll('.close').forEach(function(closeBtn) {
        closeBtn.addEventListener('click', function() {
            this.closest('.likes-popup').style.display = 'none';
        });
    });
});
>>>>>>> 85bcc1d (changes for deployment)
