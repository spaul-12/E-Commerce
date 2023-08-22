var CartList = document.getElementById("CartList")
var PlaceOrder = document.getElementById("Placeorder")
var flag = false
var price = 0
var noofitems = 0

// window['my'] = document.getElementById("Searchbar").value
// var searchvalue = document.getElementById("Searchbar").value
// localStorage.setItem('searchvalue', searchvalue);

const DisplayCarts = async() => {
    const response = await fetch("/api/user/private/getcartdata");
    if (response.status !== 200) {
        console.log("cannot fetch data");
    }
    let data = await response.json();
    
    data.forEach((ele) => {
        price = price + ele.Totalprice
        noofitems++ ;
    });
    
    flag = false
    if(price){
        document.getElementById("totalprice").innerHTML = "total price: "+price;
    }
    data.forEach(ele => {
        //Creating Card
        CreateCards(ele);

    });

    if(flag){
        PlaceOrder.innerText = "Place Order";
        PlaceOrder.addEventListener("click", Checkout);
    }else{
        PlaceOrder.remove();
    }

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
    time.innerText = "Added to cart on " +ele.Time;
    time.value = ele.Time
    card.appendChild(time)
    if(!ele.St){
        var msg = document.createElement("p");
        msg.className = "text-center p-1 m-1"; msg.style = "color: red;"
        msg.innerText = "Currently out of stock";
        card.appendChild(msg);
    }else{
        flag = true
    }
    var removebtn = document.createElement("a")
    removebtn.href = "javascript:void(0)"
    removebtn.id = ele.Bookid
    removebtn.className = "btn btn-outline-warning text-center mx-5 my-1 d-inline-block"
    removebtn.innerText = "Remove from cart"
    removebtn.addEventListener("click", function(){RemoveCart(this.id)})
    card.appendChild(removebtn)

    CartList.appendChild(card)
    console.log(card)
}

async function RemoveCart(id){
    t = document.getElementById("time "+id).value
    console.log(t)
    const response = await fetch("/api/user/private/deletefromcart", {
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
        alert("an error occured while removing item from cart")
    } else {
        alert("cart item removed successfully")
        window.location.href = "carts.html"
    }
}

function Checkout(){
    CartList.remove()
    document.getElementById("orderbtn").remove()
    let html = ''
    html += `<main>
    <div class="py-5 text-center">
      <h2>Checkout</h2>
    </div>

    <div class="row g-3">
      <div class="col-md-5 col-lg-4 order-md-last">
        <h4 class="d-flex justify-content-between align-items-center mb-3">
          <span class="text-muted">Your cart</span>
        </h4>
        <ul class="list-group mb-3">
          <li class="list-group-item d-flex justify-content-between lh-sm">
            <div>
              <h6 class="my-0">Total</h6>
              <small class="text-muted">Cart Items</small>
            </div>
            <span class="text-muted">${noofitems}</span>
          </li>
         
          <li class="list-group-item d-flex justify-content-between">
            <span>Total Price</span>
            <strong>${price}</strong>
          </li>
        </ul>

      </div>
      <div class="col-md-7 col-lg-8">
        <h4 class="mb-3">Shipping address</h4>


        <div class="needs-validation">
          <div class="row g-3">
            <div class="col-sm-6">
              <label for="firstName" class="form-label">First name</label>
              <input type="text" class="form-control" id="firstName" placeholder="" value="" required="">
              <div class="invalid-feedback">
                Valid first name is required.
              </div>
            </div>

            <div class="col-sm-6">
              <label for="lastName" class="form-label">Last name</label>
              <input type="text" class="form-control" id="lastName" placeholder="" value="" required="">
              <div class="invalid-feedback">
                Valid last name is required.
              </div>
            </div>


            <div class="col-12">
              <label for="phone" class="form-label">Phone <span class="text-muted"></span></label>
              <input type="tel" class="form-control" id="phone" placeholder="+91-1111111111" value="" required="">
              <div class="invalid-feedback">
                Please enter a valid phone for shipping updates.
              </div>
            </div>

            <div class="col-12">
              <label for="address" class="form-label">Address</label>
              <input type="text" class="form-control" id="address" placeholder="1234 Main St" required="">
              <div class="invalid-feedback">
                Please enter your shipping address.
              </div>
            </div>

            <div class="col-12">
              <label for="address2" class="form-label">Address 2 <span class="text-muted">(Optional)</span></label>
              <input type="text" class="form-control" id="address2" placeholder="Apartment or suite">
            </div>

            <div class="col-md-5">
              <label for="country" class="form-label">Country</label>
              <input class="form-select" id="country" required=""></input>
              <div class="invalid-feedback">
                Please select a valid country.
              </div>
            </div>

            <div class="col-md-4">
              <label for="state" class="form-label">State</label>
              <input class="form-select" id="state" required=""></input>
              <div class="invalid-feedback">
                Please provide a valid state.
              </div>
            </div>

            <div class="col-md-3">
              <label for="zip" class="form-label">Zip</label>
              <input type="text" class="form-control" id="zip" placeholder="" required="">
              <div class="invalid-feedback">
                Zip code required.
              </div>
            </div>
          </div>

          <hr class="my-4">


          <h4 class="mb-3">Payment</h4>

          <div class="my-3">
            <div class="form-check">
              <input id="credit" name="paymentMethod" type="radio" class="form-check-input" checked="" required="" value="Credit card">
              <label class="form-check-label" for="credit">Credit card</label>
            </div>
            <div class="form-check">
              <input id="debit" name="paymentMethod" type="radio" class="form-check-input" required="" value="Debit card">
              <label class="form-check-label" for="debit">Debit card</label>
            </div>
            <div class="form-check">
              <input id="paypal" name="paymentMethod" type="radio" class="form-check-input" required="" value="PayPal">
              <label class="form-check-label" for="paypal">PayPal</label>
            </div>
            <div class="form-check">
              <input id="netbanking" name="paymentMethod" type="radio" class="form-check-input" required="" value="Net Banking">
              <label class="form-check-label" for="netbanking">Net Banking</label>
            </div>
            <div class="form-check">
              <input id="cashondelivery" name="paymentMethod" type="radio" class="form-check-input" required="" value="Cash on delivery">
              <label class="form-check-label" for="cashondelivery">Cash on delivery</label>
            </div>
          </div>

          <div class="row gy-3">
            <div class="col-md-6">
              <label for="cc-name" class="form-label">Name on card</label>
              <input type="text" class="form-control" id="cc-name" placeholder="" required="">
              <small class="text-muted">Full name as displayed on card</small>
              <div class="invalid-feedback">
                Name on card is required
              </div>
            </div>

            <div class="col-md-6">
              <label for="cc-number" class="form-label">Credit card number</label>
              <input type="text" class="form-control" id="cc-number" placeholder="" required="">
              <div class="invalid-feedback">
                Credit card number is required
              </div>
            </div>

            <div class="col-md-3">
              <label for="cc-expiration" class="form-label">Expiration</label>
              <input type="text" class="form-control" id="cc-expiration" placeholder="" required="">
              <div class="invalid-feedback">
                Expiration date required
              </div>
            </div>

            <div class="col-md-3">
              <label for="cc-cvv" class="form-label">CVV</label>
              <input type="text" class="form-control" id="cc-cvv" placeholder="" required="">
              <div class="invalid-feedback">
                Security code required
              </div>
            </div>
          </div>

          <hr class="my-4">

          <button class="w-100 btn btn-primary btn-lg" id="placecartorders">Continue</button>
          <button class="w-100 btn btn-danger btn-lg" id="cancel">Cancel</button>
        </div>
      </div>
    </div>
  </main>`
    
    document.getElementById("checkout").innerHTML = html;
    document.getElementById("placecartorders").addEventListener("click", PlaceCartOrder)
    document.getElementById("cancel").addEventListener("click", function(){window.location.reload();})
}


async function PlaceCartOrder(){
    var address = document.getElementById("address").value
    if(!address){
        alert("enter address")
        return
    }
    var address2 = document.getElementById("address2").value
    var phoneno = document.getElementById("phone").value
    if(!phoneno){
        alert("enter phone no")
        return
    }
    var country = document.getElementById("country").value
    if(!country){
        alert("enter country name")
        return
    }
    var state = document.getElementById("state").value
    if(!state){
        alert("enter state name")
        return
    }
    var zip = document.getElementById("zip").value
    if(!zip){
        alert("enter zip")
        return
    }

    if(address2){
        address = address + ',' + address2 + ', State- ' + state + ', Country- ' + country + ', ZIP- ' + zip + ', Contact no.- ' + phoneno
    }else{
        address = address + ', State- ' + state + ', Country- ' + country + ', ZIP- ' + zip + ', Contact no.- ' + phoneno
    }

    var paymentmethod = document.querySelector('input[name="paymentMethod"]:checked').value;

    console.log(address)
    console.log(paymentmethod)
    const response = await fetch("/api/user/private/placecartorders",{
           method: 'POST',
           body: JSON.stringify({
               "shippingaddress": address,
               "paymentmethod": paymentmethod,
           }),
           headers: {
               'Content-Type' : 'application/json'
           }
    });
    if (response.status !== 200) {
        console.log("cannot fetch data");
    }

    var data = await response.json();

    if(!(data.status)){
        alert("some oreders could not be placed")
        window.location.reload()
    } 
    else {
        alert("orders placed successfully");
        window.location.href = "orders.html";

    }
}