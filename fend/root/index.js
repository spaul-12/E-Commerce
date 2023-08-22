   var BookList = document.getElementById("BookList")
   /*window['my'] = document.getElementById("Searchbar").value
   var searchvalue = document.getElementById("Searchbar").value
   localStorage.setItem('searchvalue', searchvalue);*/

   const DisplayBooks = async() => {
       const response = await fetch("/api/user/getbookstock");
       if (response.status !== 200) {
           console.log("cannot fetch data");
       }
       let data = await response.json();
       //console.log(data.length);
       data.books.forEach(ele => {
           //Creating Card
           CreateCards(ele);

       });

   };



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
       card.appendChild(bookname)
       var bookprice = document.createElement("p");
       bookprice.className = "text-center p-1 m-1"
       bookprice.innerText = "Rs." + ele.Price;
       card.appendChild(bookprice)
       var buybtn = document.createElement("a")
       buybtn.href = "javascript:void(0)"
       buybtn.id = ele.Bookid
       buybtn.className = "btn btn-outline-primary text-center mx-5 my-1 d-inline-block"
       buybtn.innerText = "Buy Now"
       buybtn.addEventListener("click", Asktosignin)
       card.appendChild(buybtn)
       BookList.appendChild(card)
       console.log(card)
   }

   function Asktosignin(){
       alert("You need to sign in first.")
       window.location.href = "signin.html"
   }
