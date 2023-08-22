var bookname = document.getElementById("bookname");
var availableqnt = document.getElementById("avlqnt");
var qntinput = document.getElementById("qntinput");
var addtocart = document.getElementById("addtocart");
var purchase = document.getElementById("purchase");
var price = document.getElementById("price")
var similarproducts = document.getElementById("similar-product-container")
var id;
var qnt;
var totalprice;

addtocart.addEventListener("click", Addtocart);
//purchase.addEventListener("click", Purchase);
purchase.addEventListener("click", Checkout);

const DisplayBook = async() => {
    const response = await fetch("/api/user/private/showbook");
       if (response.status !== 200) {
           console.log("cannot fetch data");
       }
    let data = await response.json();

    id = data.selectedbook.Bookid;
    bookname.innerText = data.selectedbook.Bookname;
    price.innerText = "Rs. "+data.selectedbook.Price;
    totalprice = data.selectedbook.Price;
    availableqnt.innerText = "Available Quantity: "+data.selectedbook.Quantity;

    //console.log(data.relatedbooks)
    if(data.relatedbooks.length){
    
        //create arrows
        var left_btn = document.createElement("button")
        left_btn.className = "pre-btn"
        var img = document.createElement("img")
        img.src = "./assets/images/arrow.png"
        img.alt = ""
        left_btn.appendChild(img)
        similarproducts.appendChild(left_btn)
        var right_btn = document.createElement("button")
        right_btn.className = "nxt-btn"
        var img = document.createElement("img")
        img.src = "./assets/images/arrow.png"
        img.alt = ""
        right_btn.appendChild(img)
        similarproducts.appendChild(right_btn)

        //create cards
        data.relatedbooks.forEach((ele) => {
            
            var productcard = document.createElement("div")
            productcard.className = "product-card"

            var productimage = document.createElement("div")
            productimage.className = "product-image"
            var newtag = document.createElement("span")
            newtag.className = "discount-tag"
            newtag.innerText = "NEW"
            productimage.appendChild(newtag)
            var img = document.createElement("img")
            img.src = "./assets/images/download.jpeg"
            img.className = "product-thumb"
            img.alt = ""
            productimage.appendChild(img)
            var showproductbtn = document.createElement("button")
            showproductbtn.className = "card-btn"
            showproductbtn.innerText = "Show Product"
            showproductbtn.id = ele.Bookid
            showproductbtn.addEventListener("click",function(){GotoProductpage(this.id)})
            productimage.appendChild(showproductbtn)
            productcard.appendChild(productimage)

            var productinfo = document.createElement("div")
            productinfo.className = "product-info"
            var productname = document.createElement("h3")
            productname.className = "product-brand"
            productname.innerText = ele.Bookname
            productinfo.appendChild(productname)
            var shortdes = document.createElement("p")
            shortdes.className = "product-short-des"
            shortdes.innerText = "a short line about this product"
            productinfo.appendChild(shortdes)
            var price = document.createElement("span")
            price.className = "price"
            price.innerText = "Rs. " +ele.Price
            productinfo.appendChild(price)
            productcard.appendChild(productinfo)

            similarproducts.appendChild(productcard)

        });
        
    }
}

async function Addtocart(){
    qnt = qntinput.value
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

async function Purchase(){
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

    
        console.log(qnt)
        const response = await fetch("/api/user/private/addentry", {
            method: 'POST',
            body: JSON.stringify({
                "bookid": Number(id),
                "quantity": Number(qnt),
                "shippingaddress": address,
               "paymentmethod": paymentmethod,
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
            alert("Order placed successfully.")
            window.location.href = "orders.html"
        }
    
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
        //window.location.href = "product.html";
        location.reload();
    }
}

function Checkout(){
    qnt = qntinput.value
    if(qnt<1){
        alert("invalid quantity")
        return
    }
    totalprice = totalprice*qnt ;
    document.getElementById("container").remove()
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
            <span class="text-muted">${qnt}</span>
          </li>
         
          <li class="list-group-item d-flex justify-content-between">
            <span>Total Price</span>
            <strong>${totalprice}</strong>
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

          <button class="w-100 btn btn-primary btn-lg" id="placeorder">Continue</button>
          <button class="w-100 btn btn-danger btn-lg" id="cancel">Cancel</button>
        </div>
      </div>
    </div>
  </main>`
    
    document.getElementById("checkout").innerHTML = html;
    document.getElementById("placeorder").addEventListener("click", Purchase)
    document.getElementById("cancel").addEventListener("click", function(){window.location.reload();})
}