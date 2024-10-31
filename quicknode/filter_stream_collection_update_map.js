function main(stream) {
    try {
        // Extract data from stream
        const data = stream.data ? stream.data : stream;
        const targetAddress = '0x536446035eF24cb011a3B55f0627df2Fad083F67'.toLowerCase();

        // Function to flatten nested arrays
        function flattenArray(arr) {
            return arr.reduce((flat, toFlatten) => {
                return flat.concat(Array.isArray(toFlatten) ? flattenArray(toFlatten) : toFlatten);
            }, []);
        }

        // Flatten the nested array structure
        const flattenedData = flattenArray(data);

        // Filter for valid transaction objects with matching address
        const filteredTransactions = flattenedData.filter(item => {
            return item && 
                   typeof item === 'object' && 
                   item.address && 
                   item.address.toLowerCase() === targetAddress;
        });

        if (filteredTransactions.length === 0) {
            return null;
        }

        return filteredTransactions;

    } catch (e) {
        console.error('Error in processing stream:', e);
        return { error: e.message };
    }
}