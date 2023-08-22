var SearchList = document.getElementById("SearchList")

 var ss =  localStorage.getItem('searchvalue')
console.log(my)

const DisplaySearchBooks = async() => {
    var flag = -1;
    const response = await fetch("search.json");
    if (response.status !== 200) {
        console.log("cannot fetch data");
    }
    let data = await response.json();
    console.log(data)
    var Searchvalue = document.getElementById("Searchbar").value
    console.log(Searchvalue);
    
    data.forEach(ele => {
        if (ele.Bookname == Searchvalue) {
            flag = ele.Bookid;
            CreateCards(ele)
            console.log("reached")
        }
    });
};
DisplaySearchBooks();

function CreateCards(ele) {
    var card = document.createElement("div");
    card.className = "card m-2";
    var img = document.createElement("img");
    img.src = "../assets/images/download.jpeg";
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
    card.appendChild(buybtn)
    SearchList.appendChild(card)
    console.log(card)
}



//displying books from data recieved from backend