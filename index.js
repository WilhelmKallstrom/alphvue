const alph_amount_text = document.getElementById('alph_amount_text')
const dollar_amount_text = document.getElementById('dollar_amount_text')
const transactions_container = document.getElementById('transactions_container')
const wallet_address_input = document.getElementById('wallet_address_input')
const wallet_address_submit_btn = document.getElementById('wallet_address_submit_btn')

let walletAddress = localStorage.getItem('wallet_address')
wallet_address_input.value = localStorage.getItem('wallet_address')

let balance = 0
let price = 0
let transactions = null

//Fetch all data from APIs
const FetchData = async () => {

    await fetch(`https://mainnet-backend.alephium.org/addresses/${walletAddress}/balance`)
        .then(response => response.json())
        .then(data => balance = data.balance / 1000000000000000000)

    await fetch('https://api.coingecko.com/api/v3/simple/price?ids=alephium&vs_currencies=usd')
        .then(response => response.json())
        .then(data => price = data.alephium.usd)

    await fetch(`https://mainnet-backend.alephium.org/addresses/${walletAddress}/transactions?page=1`)
        .then(response => response.json())
        .then(data => transactions = data)


    await UpdateUI()
}

//Update the UI
const UpdateUI = async () => {

    transactions_container.innerHTML = null
    alph_amount_text.innerHTML = `ℵ${balance.toFixed(2)}`
    dollar_amount_text.innerHTML = `$${(balance * price).toFixed(2)}`

    transactions.forEach(transaction => {

        let transactionType = ""
        let transactionAmount = 0
        let transactionColor = ''

        const transactionHash = (transaction.hash).toString()

        const transactionsOut = transaction.outputs
        const transactionsIn = transaction.inputs

        transactionsOut.forEach(element => {
            if (element.address == walletAddress) {
                transactionType = '+'
                transactionAmount = element.amount / 1000000000000000000
                transactionColor = 'class="text-success fw-bold"'
            }

        })

        transactionsIn.forEach(element => {
            if (element.address == walletAddress) {
                transactionType = '-'
                transactionAmount = element.amount / 1000000000000000000
                transactionColor = 'class="text-danger fw-bold"'
            }

        })

        const transactionMarkup =
            `
                <div class="card mb-3">
                    <div class="card-body">


                        <div class="d-flex justify-content-between">
                            <div>Hash: ${transactionHash.substring(0, 16)}...</div>
                            <p ${transactionColor}>${transactionType}${transactionAmount.toFixed(2)} ℵ</p>
                        </div>


                        <p class="mb-0">${new Date(transaction.timestamp)}</p>
                    </div>
                </div>

`
        const newTransaction = document.createElement("div")
        newTransaction.innerHTML = transactionMarkup
        transactions_container.appendChild(newTransaction)

    })

}

FetchData()


wallet_address_submit_btn.addEventListener('click', async () => {
    localStorage.setItem('wallet_address', wallet_address_input.value)
    location.reload()
})