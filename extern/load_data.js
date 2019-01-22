const dataset_path = '../data/dataset/',
    nomination_json_path = dataset_path + 'nomination_2.json',
    people_json_path = dataset_path + 'people.json',
    country_json_path = dataset_path + 'people_country.json';

const viz_data = function (nomination_data, people_data, country_data) {
    console.log(nomination_data["32"]);
};

const fetch_data_and_viz = function (callback) {
    $.getJSON(nomination_json_path, function (nomination_data) {
        $.getJSON(people_json_path, function (people_data) {
            $.getJSON(country_json_path, function (country_data) {
                callback(nomination_data, people_data, country_data);
            })
        })
    })
};

// fetch_data_and_viz(viz_data);

