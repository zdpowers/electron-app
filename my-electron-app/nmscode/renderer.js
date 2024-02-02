// Navigate to Search application
document.getElementById('searchButton').addEventListener('click', () => {
    nmsapp.navToSearch();
});

// Navigate to AI application
document.getElementById('aiButton').addEventListener('click', () => {
    nmsapp.navToAI();
});

// SIDE MENU LOGIC
const sidemenu = document.getElementById('sidemenu');
const maincontainer = document.getElementById('maincontainer');
document.getElementById('nmsButton').addEventListener('click', () => {
  if(sidemenu.style.display == "none") {
    sidemenu.style.display = "flex";
    maincontainer.style.marginLeft = "20em";
  } else {
    sidemenu.style.display = "none";
    maincontainer.style.marginLeft = "45px";
  }
});

// MENU OPTION ONCLICKS
const addUsersBtn = document.getElementById('addUsersBtn'); //ADD ONCLICK
const addContainer = document.getElementById('addContainer');

const verifyUsersBtn = document.getElementById('verifyUsersBtn'); //ADD ONCLICK
const verifyContainer = document.getElementById('verifyContainer');
addUsersBtn.addEventListener('click', () => {
    if(addContainer.style.display == "none") {
        verifyContainer.style.display = 'none';
        addContainer.style.display = 'block';
    }
});
verifyUsersBtn.addEventListener('click', () => {
    if(verifyContainer.style.display = 'none') {
        addContainer.style.display = 'none';
        verifyContainer.style.display = 'block';
    }
});