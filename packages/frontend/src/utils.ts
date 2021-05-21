interface CountryMapping {
    [name: string]: string;
}
const countryMapping: CountryMapping = {
    'Cabo Verde': 'Cape Verde',
    'Cape Verde': 'Cape Verde',
    'Central African Rep': 'Central African Republic',
    "Cote d'Ivoire": 'Ivory Coast',
    "Côte d'Ivoire": 'Ivory Coast',
    'Congo, Dem Rep of the': 'Democratic Republic of the Congo',
    'Congo, the Democratic Republic of the': 'Democratic Republic of the Congo',
    Swaziland: 'Eswatini',
    'Gambia, The': 'Gambia',
    'Congo, Rep of the': 'Republic of the Congo',
    Congo: 'Republic of the Congo',
    'Sao Tome & Principe': 'São Tomé and Príncipe',
    'Sao Tome and Principe': 'São Tomé and Príncipe',
    'Tanzania, United Republic of': 'Tanzania',
    'The Gambia': 'Gambia',
};

export const countryNameMapping = (name: string) => {
    if (!countryMapping[name]) {
        return name;
    } else {
        return countryMapping[name];
    }
};
