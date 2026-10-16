let products = [];

const getProductsData = async () => {
    const res = await fetch("https://dummyjson.com/products");
    const data = await res.json();

    products = data.products;

    const productsContainer = document.getElementById("products-container");

    products.slice(0, 10).forEach((product) => {
        const div = document.createElement("div");

        const img = document.createElement("img");
        img.src = product.thumbnail;
        img.alt = product.title;

        const title = document.createElement("h2");
        title.innerText = product.title;

        const price = document.createElement("h3");
        price.innerText = `$${product.price}`;

        const incrementBtn = document.createElement("button");
        incrementBtn.innerText = "+";

        const decrementBtn = document.createElement("button");
        decrementBtn.innerText = "-";

        const addItemSpan = document.createElement("span");
        addItemSpan.innerText = "ADD";

        div.appendChild(img);
        div.appendChild(title);
        div.appendChild(price);
        div.appendChild(incrementBtn);
        div.appendChild(decrementBtn);
        div.appendChild(addItemSpan);

        productsContainer.appendChild(div);

        let counter=0;

        incrementBtn.addEventListener("click", ()=>{
            counter++;
            addItemSpan.innerText = counter;
        })
        
        decrementBtn.addEventListener("click", ()=>{
            counter--;
            addItemSpan.innerText = counter;
        })
    });
};

getProductsData();
