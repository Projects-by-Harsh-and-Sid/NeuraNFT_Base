function main(data) {
    try {
        // If stream is configured with metadata in the body, the data may be nested under a `data` key
        const data = stream.data ? stream.data : stream

        const addresses = [
            '0x13846e6fDe06853f6CC822A58f97AdbEbF1e6AFd'
        ]
        var addressSet = new Set(addresses.map(address => address.toLowerCase()))
        var paddedAddressSet = new Set(
            addresses.map(
                address => '0x' + address.toLowerCase().slice(2).padStart(64, '0')
            )
        )

        var matchingTransactions = []
        var matchingReceipts = []

        data.block.transactions.forEach(transaction => {
            let transactionMatches =
                (transaction.from && addressSet.has(transaction.from.toLowerCase())) ||
                (transaction.to && addressSet.has(transaction.to.toLowerCase()))

            if (transactionMatches) {
                matchingTransactions.push(transaction)
            }
        })

        data.receipts.forEach(receipt => {
            let receiptMatches =
                receipt.logs &&
                receipt.logs.some(
                    log =>
                        log.topics &&
                        log.topics.length > 1 &&
                        (paddedAddressSet.has(log.topics[1]) ||
                            (log.topics.length > 2 && paddedAddressSet.has(log.topics[2])))
                )
            if (receiptMatches) {
                matchingReceipts.push(receipt)
            }
        })

        if (matchingTransactions.length === 0 && matchingReceipts.length === 0) {
            return null
        }

        return {
            transactions: matchingTransactions,
            receipts: matchingReceipts,
        }
    } catch (e) {
        return { error: e.message }
    }
}