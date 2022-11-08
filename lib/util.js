// Organises arrays into arrays of pairs
// Used mostly for TwoUps + content
export const pair = (arr) =>
    arr.reduce(function (rows, key, index) {
        return (
            (index % 2 == 0 ? rows.push([key]) : rows[rows.length - 1].push(key)) &&
            rows
        );
    }, []);