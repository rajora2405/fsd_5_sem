const mypromise = new Promise((resolve, reject) => {
    let age = 16;

    if (age >= 18) {
        resolve("Eligible for vote.");
    } else {
        reject("Not Eligible for vote.");
    }
});

const checkEligibility = async () => {
    try {
        const msg = await mypromise;
        console.log(msg);
    } catch (error) {
        console.log(error);
    }
};

checkEligibility();