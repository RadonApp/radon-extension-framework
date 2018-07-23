export function getRegexMatches(regex, str) {
    let results = [];
    let match;

    while((match = regex.exec(str)) !== null) {
        if(match.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        // Add matches to result
        results.push(...match.splice(1));
    }

    return results;
}

export default {
    getMatches: getRegexMatches
};
