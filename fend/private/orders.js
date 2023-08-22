var CartList = document.getElementById("OrderList")
// window['my'] = document.getElementById("Searchbar").value
// var searchvalue = document.getElementById("Searchbar").value
// localStorage.setItem('searchvalue', searchvalue);

const DisplayOrders = async() => {
    const response = await fetch("/api/user/private/getpurchasedata");
    if (response.status !== 200) {
        console.log("cannot fetch data");
    }
    let data = await response.json();
    console.log(data[1])

    data.forEach(ele => {
        //Creating Card
        CreateCards(ele);

    });

};

//var quantity



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
    bookname.id = "book "+ele.Bookid;
    card.appendChild(bookname)
    var quantity = document.createElement("p");
    quantity.className = "text-center p-1 m-1"
    quantity.innerText = "Selected Quantity : " +ele.Quantity;
    card.appendChild(quantity)
    var bookprice = document.createElement("p");
    bookprice.className = "text-center p-1 m-1"
    bookprice.innerText = "Rs." + ele.Totalprice;
    card.appendChild(bookprice)
    var time = document.createElement("p");
    time.className = "text-center p-1 m-1"
    time.id = "time "+ele.Bookid
    time.innerText = "Order placed on " +ele.Time;
    time.value = ele.Time
    card.appendChild(time)
    var trackbtn = document.createElement("button")
    trackbtn.id = ele.Bookid
    trackbtn.className = "btn btn-outline-warning text-center mx-5 my-1 d-inline-block"
    trackbtn.innerText = "Track Package"
    trackbtn.addEventListener("click", function(){Trackpage(this.id)})
    card.appendChild(trackbtn)
    var removebtn = document.createElement("a")
    removebtn.href = "javascript:void(0)"
    removebtn.id = ele.Bookid
    removebtn.className = "btn btn-outline-warning text-center mx-5 my-1 d-inline-block"
    removebtn.innerText = "Cancel Order"
    removebtn.addEventListener("click", function(){CancelOrder(this.id, document.getElementById("time "+this.id).value)})
    card.appendChild(removebtn)

    CartList.appendChild(card)
    console.log(card)
}

async function CancelOrder(id, t){
    console.log(t)
    alert("are you sure ?")
    const response = await fetch("/api/user/private/deleteentry", {
        method: 'POST',
        body: JSON.stringify({
            bookid: Number(id),
            time: t,
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
        alert("an error occured while cancelling the order")
    } else {
        console.log("order cancelled successfully")
        window.location.href = "orders.html"
    }
}

async function Trackpage(id){
    t = document.getElementById("time "+id).value
    const response = await fetch("/api/user/private/trackpage", {
        method: 'POST',
        body: JSON.stringify({
            bookid: Number(id),
            time: t,
        }),
        headers: {
            'Content-Type':'application/json'
        }
    });
    if (response.status !== 200) {
        console.log("cannot fetch data");
        return;
     }
     let data = await response.json();
     console.log(data)

     CartList.remove();

     let html = ''
     html += `<div class="container">
     <div class="row">
         <div class="col-md-5">
             <div id="carouselExampleSlidesOnly" class="carousel slide" data-bs-ride="carousel">
                 <div class="carousel-inner">
                   <div class="carousel-item active">
                     <img src="./assets/images/download.jpeg" class="d-block w-100" alt="...">
                   </div>
                   <div class="carousel-item">
                     <img src="./assets/images/download.jpeg" class="d-block w-100" alt="...">
                   </div>
                   <div class="carousel-item">
                     <img src="./assets/images/download.jpeg" class="d-block w-100" alt="...">
                   </div>
                 </div>
               </div>
         </div>
         <div class="col-md-7">
             <p class="newarrival text-center">Order Details : </p>
             <p>Order # : ${data.OrderID}</p>
             <h4>Product name: ${data.bookname}</h4>
             <p>Selected Quantity: ${data.quantity}</p>
             <p class="price" id="price">Total : ${data.price}</p>
             <p>Ordered on : ${data.time}</p>
             <p>Shipping Address : ${data.ShippingAddress}</p>
             <p>Payment method : ${data.PaymentMethod}</p>
             <button type="button" class="btn btn-outline-danger cart" id="cancelorder">Cancel Order</button>
         </div>
     </div>

     </div>

     <br>
     <br>
     <hr style="margin: 0 30px;">
     <br>
     <section class="similar-product">
         <h2 class="product-category mx-4 " >Status</h2>
     </section>
     <div style="display:flex; flex-direction: row;">
     <div class="progress mx-4" style="width:50%;">
        <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-label="Animated striped example" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100" style="width: 50%"></div>
        </div>
        <p>Product Packed</p></div>

 
`
   document.getElementById("ordertracking").innerHTML = html;
   document.getElementById("cancelorder").addEventListener("click", function(){CancelOrder(id, data.time)});
}