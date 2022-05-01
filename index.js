const alph_amount_text = document.getElementById('alph_amount_text')
const dollar_amount_text = document.getElementById('dollar_amount_text')
const transactions_container = document.getElementById('transactions_container')
const wallet_address_input = document.getElementById('wallet_address_input')
const wallet_address_submit_btn = document.getElementById('wallet_address_submit_btn')

const recent_transactions_text = document.getElementById('recent_transactions_text')

const wallet_reminder = document.getElementById('wallet-reminder')

let walletAddress = localStorage.getItem('wallet_address')

let settings_open = false


//Settings popup
const settings_popup = document.getElementById('settings-popup')
const settings_popup_confirm_btn = document.getElementById('settings-popup-confirm-btn')
const settings_popup_close_btn = document.getElementById('settings-popup-close-btn')
const settings_popup_wallet_field = document.getElementById('settings-popup-wallet-field')
settings_popup_wallet_field.value = localStorage.getItem('wallet_address')

const settings_btn = document.getElementById('settings-btn')

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

    if (walletAddress == '' || walletAddress == null) {
        alph_amount_text.innerHTML = 'Welcome'
        dollar_amount_text.innerHTML = 'Enter Your Wallet Address'
        settings_popup_close_btn.disabled = true
        settings_btn.disabled = true
        settings_btn.style.opacity = 0
        recent_transactions_text.innerHTML = ''
        settings_popup.style.transform = 'translateY(0)'
        settings_open = true
    }

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
                transactionColor = 'class="text-green fw-bold"'
            }

        })

        transactionsIn.forEach(element => {
            if (element.address == walletAddress) {
                transactionType = '-'
                transactionAmount = element.amount / 1000000000000000000
                transactionColor = 'class="text-red fw-bold"'
            }

        })

        const transactionMarkup =
            `
                <div class="card mb-3 shadow-sm">
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






settings_btn.addEventListener('click', async () => {

    if (!settings_open) {
        //settings_popup.style.bottom = '0'
        settings_popup.style.transform = 'translateY(0)'
    } else {
        settings_popup.style.transform = 'translateY(50vh)'
        settings_popup_wallet_field.value = localStorage.getItem('wallet_address')
        wallet_reminder.style.transform = 'translateY(-50px)'
    }

    settings_open = !settings_open
})


//Closing Settings
settings_popup_close_btn.addEventListener('click', async () => {
    settings_popup_wallet_field.value = localStorage.getItem('wallet_address')
    settings_popup.style.transform = 'translateY(50vh)'
    wallet_reminder.style.transform = 'translateY(-50px)'
    settings_open = false
})

settings_popup_confirm_btn.addEventListener('click', async () => {

    if (settings_popup_wallet_field.value != '') {
        settings_popup.style.transform = 'translateY(50vh)'
        wallet_reminder.style.transform = 'translateY(-50px)'
        settings_open = false
        setTimeout(function () {
            localStorage.setItem('wallet_address', settings_popup_wallet_field.value)
            location.reload()
        }, 500)

    }else{
        wallet_reminder.style.transform = 'translateY(75px)'


    }
})