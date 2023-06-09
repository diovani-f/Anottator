const firebaseConfig = {
    apiKey: "AIzaSyBOYLiD7-nU86tVYkhk0CKvuD8Vpjvw4Bw",
    authDomain: "visu-38b3c.firebaseapp.com",
    databaseURL: "https://visu-38b3c-default-rtdb.firebaseio.com",
    projectId: "visu-38b3c",
    storageBucket: "visu-38b3c.appspot.com",
    messagingSenderId: "452302912187",
    appId: "1:452302912187:web:1b5c765071846f2a39079e"
};

firebase.initializeApp(firebaseConfig);
var database = firebase.database();

var videos = []; // Array para armazenar os vídeos e suas anotações

function adicionarVideo() {
    var videoLink = document.getElementById("videoLink").value;
    var videoId = extrairVideoId(videoLink);
    var videosDiv = document.getElementById("videos");

    var videoContainer = document.createElement("div");
    videoContainer.className = "col-md-6 video-container";
    videoContainer.setAttribute("data-video-id", videoId);

    var iframe = document.createElement("iframe");
    iframe.src = "https://www.youtube.com/embed/" + videoId;
    iframe.width = "100%";
    iframe.height = "315";
    iframe.allowFullscreen = true;
    iframe.frameborder = 0;
    videoContainer.appendChild(iframe);

    // Adicionar vídeo ao array de vídeos
    var video = {
        id: videoId,
        notas: []
    };
    videos.unshift(video); // Adicionar no início do array

    videosDiv.insertBefore(videoContainer, videosDiv.firstChild); // Inserir o vídeo no início da lista

    adicionarNovaNota(video);
    salvarNoFirebase(video);
}

function extrairVideoId(videoLink) {
    var regex = /(?:\?v=|&v=|youtu\.be\/|\/v\/|\/embed\/|\/videos\/|user\/\S+|\/v=|\/e\/|watch\?v=|\&v=|v%3A|v\/|e\/|youtube\.com\/v\/)([^#\&\?\/]{11})/;
    var match = videoLink.match(regex);
    return match ? match[1] : null;
}

const notas = JSON.parse(localStorage.getItem("notas"));

if (notas) {
    notas.forEach(nota => adicionarNovaNota(nota));
}

function adicionarNovaNota(video) {
    const videosDiv = document.getElementById("videos");
    const videoContainer = videosDiv.querySelector(`[data-video-id="${video.id}"]`);

    const nota = document.createElement('div');
    nota.classList.add('nota');

    nota.innerHTML = `
        <div class="configuracao">
            <button class="editar">
                <i class="fas fa-edit"></i>
            </button>
            <button class="deletar" data-video-id="${video.id}">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
        <div class="main hidden"></div>
        <textarea></textarea>
    `;

    const btnEditar = nota.querySelector('.editar');
    const btnDeletar = nota.querySelector('.deletar');
    const main = nota.querySelector('.main');
    const textArea = nota.querySelector('textarea');

    btnDeletar.addEventListener('click', () => {
        nota.remove();
        videoContainer.remove();
        videos = videos.filter(v => v.id !== video.id);
        storage();
        deletarDoFirebase(video);
    });

    btnEditar.addEventListener('click', () => {
        main.classList.toggle('hidden');
        textArea.classList.toggle('hidden');
    });

    textArea.addEventListener('input', (e) => {
        main.innerHTML = marked(e.target.value);
        video.notas.push(e.target.value);
        storage();
        salvarNoFirebase(video);
    });

    videoContainer.appendChild(nota);
}

function salvarNoFirebase(video) {
    database.ref('videos/' + video.id).set(video);
}

function deletarDoFirebase(video) {
    database.ref('videos/' + video.id).remove();
}

function storage() {
    const notas = videos.flatMap(video => video.notas);
    localStorage.setItem('notas', JSON.stringify(notas));
}
