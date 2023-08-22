var BookList = document.getElementById("BookList")
var user = document.getElementById("user")
// var logout = document.getElementById("logout")
window['my'] = document.getElementById("Searchbar").value
var searchvalue = document.getElementById("Searchbar").value
localStorage.setItem('searchvalue', searchvalue);

// logout.addEventListener("click", Logout)

const DisplayUser = async() => {
 const response = await fetch("/api/user/getusername");
 if (response.status !== 200) {
     console.log("cannot fetch data");
 }
 let data = await response.json();
 user.innerText = "Welcome "+data;
};

const DisplayBooks = async() => {
    const response = await fetch("/api/user/getfilteredbooks");
    if (response.status !== 200) {
        console.log("cannot fetch data");
    }
    let data = await response.json();
    //console.log(data[1])

    data.forEach(ele => {
        //Creating Card
        CreateCards(ele);

    });

};

var qnt;



function CreateCards(ele) {
    var card = document.createElement("div");
    card.className = "card m-2";
    var img = document.createElement("img");
    img.src = "/assets/images/download.jpeg";
    img.alt = "BookImg";
    card.appendChild(img);
    var bookname = document.createElement("p");
    bookname.className = "text-center p-1 m-1"
    bookname.innerText = ele.Bookname;
    bookname.id = ele.Bookid;
    bookname.style = "cursor: pointer;"
    bookname.addEventListener("click", function(){GotoProductpage(this.id)})
    card.appendChild(bookname)
    var quantity = document.createElement("p");
    quantity.className = "text-center p-1 m-1"
    quantity.innerText = "Available Quantity : " +ele.Quantity;
    card.appendChild(quantity)
    var bookprice = document.createElement("p");
    bookprice.className = "text-center p-1 m-1"
    bookprice.innerText = "Rs." + ele.Price;
    card.appendChild(bookprice)
    var quaninp = document.createElement("div");
    quaninp.className = "mb-3 mx-3"
    var inp = document.createElement("input");
    inp.type = "number"
    inp.className = "form-control";
    inp.id = "qntinp " +ele.Bookid
    inp.placeholder = "Enter Quantity required"
    quaninp.appendChild(inp);
    card.appendChild(quaninp)
    var buybtn = document.createElement("button")
    //buybtn.href = "javascript:void(0)"
    buybtn.id = ele.Bookid
    buybtn.className = "btn btn-outline-primary text-center mx-5 my-1 d-inline-block"
    buybtn.innerText = "Buy Now"
    buybtn.addEventListener("click", function(){PurchaseItem(this.id)})
    //console.log(buybtn)
    card.appendChild(buybtn)
    var cartbtn = document.createElement("button")
    //cartbtn.href = "javascript:void(0)"
    cartbtn.id = ele.Bookid
    cartbtn.className = "btn btn-outline-warning text-center mx-5 my-1 d-inline-block"
    cartbtn.innerText = "Add to cart"
    cartbtn.addEventListener("click", function(){AddItemtoCart(this.id)})
    //cartbtn.addEventListener("click", function(){senddata(this.id)})
    card.appendChild(cartbtn)
    BookList.appendChild(card)
    console.log(card)
}

async function GotoProductpage(id) {
    const response = await fetch("/api/user/private/createbookcookie", {
        method: 'POST',
        body: JSON.stringify({
            bookid: id,
        }),
        headers: {
            'Content-Type' : 'application/json'
        }
    });
    if(response.status !== 200) {
        console.log("cannot fetch data");
    }
    let data = await response.json();
    if(data.error){
        console.log("cookie could not be created");
    } else {
        window.location.href = "product.html";
    }
}


async function PurchaseItem(id) {
 console.log(Number(id))
 qnt = document.getElementById("qntinp "+id).value
 //console.log(quantity)
 if(qnt < 1){
     alert("invalid quantity")
 }else{
     console.log(qnt)
     const response = await fetch("/api/user/private/addentry", {
         method: 'POST',
         body: JSON.stringify({
             bookid: Number(id),
             quantity: Number(qnt),
         }),
         headers: {
             'Content-Type':'application/json'
         }
     });
     if (response.status !== 200) {
        console.log("cannot fetch data");
     }
     let data = await response.json();
     if(data.error){
         console.log(data)
         alert("Order Could not be placed")
     } else {
         window.location.href = "orders.html"
     }
 }
}

async function AddItemtoCart(id){
 qnt = document.getElementById("qntinp "+id).value
 //console.log(quantity)
 if(qnt < 1){
     alert("invalid quantity")
 }else{
     console.log(qnt)
     const response = await fetch("/api/user/private/addtocart", {
         method: 'POST',
         body: JSON.stringify({
             bookid: Number(id),
             quantity: Number(qnt),
         }),
         headers: {
             'Content-Type':'application/json'
         }
     });
     if (response.status !== 200) {
        console.log("cannot fetch data");
     }
     let data = await response.json();
     if(data.error){
         console.log(data)
         alert(data.msg)
     } else {
         alert("Item added to cart")
         window.location.href = "carts.html"
     }
 }
}

/*async function Logout(){
 const response = await fetch("/api/user/logout");
 if (response.status !== 200) {
     console.log("cannot fetch data");
 }
 let data = await response.json()
 console.log(data)
 
}*/