// SET YEAR IN ATTRIBUTION

const year = document.querySelector(".year");
year.textContent = new Date().getFullYear();

// NAVBAR HIDE/SHOW ON SCROLL

const navbar = document.querySelector(".navbar");
const list = document.querySelector(".navbar__list");
if(navbar){
    let last_scroll_top = 0;
    window.addEventListener('scroll', ()=>{
        let scroll_top = window.scrollY;
        if(!list.classList.contains("active")){
            if(scroll_top < last_scroll_top){
                navbar.classList.remove("scrolled-down");
                navbar.classList.add("scrolled-up");
            }else{
                navbar.classList.remove("scrolled-up");
                navbar.classList.add("scrolled-down");
            }
        }
        last_scroll_top = scroll_top;
    }
    )
}

// NAVBAR MENU TOGGLE

const menu = document.querySelector(".navbar__menu-btn");
const body = document.querySelector("body");
const menu_icon = document.querySelector(".navbar__menu-icon");
menu.addEventListener("click", () => {
    list.classList.toggle("active");
    body.classList.toggle("stop-scrolling");
    if(list.classList.contains("active")){
        menu_icon.setAttribute("xlink:href", "img/sprites.svg#icon-close");
    }else{
        menu_icon.setAttribute("xlink:href", "img/sprites.svg#icon-menu");
    }
})

// HIDE NAVBAR UPON ARRIVING AT A SECTION

let autoscroll = false;
const menu_links = document.querySelectorAll(".navbar__link");
for (let link of menu_links){
    link.addEventListener("click", ()=> {
        autoscroll = true;
        body.classList.remove("stop-scrolling");
        list.classList.remove("active");
    })
}

let timer = null;
window.addEventListener("scroll", ()=> {
    if(autoscroll){
        if(timer !== null){
            clearTimeout(timer);
        }
        timer = setTimeout(()=> {
            navbar.classList.remove("scrolled-up");
            navbar.classList.add("scrolled-down");
            autoscroll = false;
        }, 50);
    }
})


// READ MORE BTN

const articles = document.querySelectorAll(".article__container");
for (let article of articles){
    const text = article.querySelector(".article__expand");
    const btn = article.querySelector(".expand__btn");
    const btn_txt = article.querySelector(".expand__txt");
    const btn_icon = article.querySelector(".expand__icon-src");
    if(text && btn){
        btn.addEventListener("click", () => {
            text.classList.toggle("show");
            if(text.classList.contains("show")){
                btn_txt.textContent = "Collapse";
                btn_icon.setAttribute("xlink:href", "img/sprites.svg#icon-shrink2")
            }else{
                btn_txt.textContent = "Expand";
                btn_icon.setAttribute("xlink:href", "img/sprites.svg#icon-enlarge2")
            }
        })
    }
}


// REVEAL ON SCROLL
const hidden_elements = document.querySelectorAll(".reveal");

function reveal() {
    for (let hidden of hidden_elements) {
      const elementTop = hidden.getBoundingClientRect().top;
      const distanceSlow = 150;
      const distanceQuick = 25;
      switch (hidden.classList.contains("reveal-quick")){
        case true:
            if (elementTop < window.innerHeight - distanceQuick) {
            hidden.classList.add("active");
            setTimeout(()=> hidden.classList.add("quick-animate"), 800);
            }
        break;
        default:
            if (elementTop < window.innerHeight - distanceSlow) {
            hidden.classList.add("active");
            setTimeout(()=> hidden.classList.add("quick-animate"), 800);
            }
        }
    }
}
  window.addEventListener("scroll", reveal)