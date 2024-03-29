const line_plot_data_transformer = function(country_data) {
    let countries = [
        "AUSTRALIA (AU) ",
        "CUBA (CU) ",
        "CAMEROON (CM) ",
        "PORTUGAL (PT) ",
        "PERU (PE) ",
        "DENMARK (DK) ",
        "SRI LANKA (LK) ",
        "SINGAPORE (SG) ",
        "URUGUAY (UY) ",
        "GREECE (GR) ",
        "ALGERIA (DZ) ",
        "GUATEMALA (GT) ",
        "LUXEMBOURG (LU) ",
        "SWITZERLAND (CH) ",
        "SERBIA (RS) ",
        "MAURITANIA (MR) ",
        "MADAGASCAR (MG) ",
        "U.S.S.R. (SU)  now GEORGIA (GE)",
        "FRANCE (FR) ",
        "GERMANY (DE) ",
        "LIBERIA (LR) ",
        "ESTONIA (EE) ",
        "DOMINICAN REPUBLIC (DO) ",
        "SAUDI ARABIA (SA) ",
        "YUGOSLAVIA (YU)  now SERBIA (RS)",
        "IRAN, ISLAMIC REPUBLIC OF (IR) ",
        "SLOVAKIA (SK) ",
        "CHILE (CL) ",
        "TUNISIA (TN) ",
        "VIETNAM (VN) ",
        "COLOMBIA (CO) ",
        "CANADA (CA) ",
        "BRAZIL (BR) ",
        "U.S.S.R. (SU)  now BELARUS (BY)",
        "UNITED STATES (US) ",
        "EGYPT (EG) ",
        "BULGARIA (BG) ",
        "TOGO (TG) ",
        "SENEGAL (SN) ",
        "NICARAGUA (NI) ",
        "RUSSIAN FEDERATION (RU)  now UKRAINE (UA)",
        "SOUTH AFRICA (ZA) ",
        "KOREA, REPUBLIC OF (KR) ",
        "YUGOSLAVIA (YU) ",
        "ICELAND (IS) ",
        "UKRAINE (UA) ",
        "BANGLADESH (BD) ",
        "SUDAN (SD) ",
        "INDIA (IN) ",
        "MALAYSIA (MY) ",
        "MAURITIUS (MU) ",
        "CZECH REPUBLIC (CZ) ",
        "JAPAN (JP) ",
        "CENTRAL AFRICAN REPUBLIC (CF) ",
        "RUSSIAN FEDERATION (RU)  now LITHUANIA (LT)",
        "TURKEY (TR) ",
        "ARGENTINA (AR) ",
        "YUGOSLAVIA (YU)  now CROATIA (HR)",
        "PHILIPPINES (PH) ",
        "EL SALVADOR (SV) ",
        "U.S.S.R. (SU) ",
        "POLAND (PL) ",
        "NIGERIA (NG) ",
        "UNITED KINGDOM (GB) ",
        "RUSSIAN FEDERATION (RU) ",
        "ECUADOR (EC) ",
        "PAKISTAN (PK) ",
        "ROMANIA (RO) ",
        "NEW ZEALAND (NZ) ",
        "MEXICO (MX) ",
        "ITALY (IT) ",
        "U.S.S.R. (SU)  now UKRAINE (UA)",
        "LITHUANIA (LT) ",
        "HUNGARY (HU) ",
        "CHINA (CN) ",
        "PUERTO RICO (PR) ",
        "BOLIVIA (BO) ",
        "HAITI (HT) ",
        "AFGHANISTAN (AF) ",
        "PARAGUAY (PY) ",
        "LAOS (LA) ",
        "BELGIUM (BE) ",
        "SYRIAN ARAB REPUBLIC (SY) ",
        "ETHIOPIA (ET) ",
        "VENEZUELA (VE) ",
        "SLOVENIA (SI) ",
        "SIERRA LEONE (SL) ",
        "NETHERLANDS (NL) ",
        "LEBANON (LB) ",
        "MYANMAR (MM) ",
        "LATVIA (LV) ",
        "SWEDEN (SE) ",
        "IRELAND (IE) ",
        "PANAMA (PA) ",
        "MALTA (MT) ",
        "ISRAEL (IL) ",
        "AUSTRIA (AT) ",
        "CROATIA (HR) ",
        "SPAIN (ES) ",
        "FINLAND (FI) ",
        "THAILAND (TH) ",
        "CONGO, THE DEMOCRATIC REPUBLIC OF THE (CD) ",
        "HONG KONG (HK) ",
        "COSTA RICA (CR) ",
        "NORWAY (NO) ",
        "CZECH REPUBLIC (CZ)  now SLOVAKIA (SK)",
        "U.S.S.R. (SU)  now LITHUANIA (LT)",
        "U.S.S.R. (SU)  now RUSSIAN FEDERATION (RU)",
        "U.S.S.R. (SU)  now ARMENIA (AM)"
    ];
    let categories = [
        "medicine",
        "chemistry",
        "physics",
        "literature",
        "peace"
    ];
    let series_ = [];
    for (let country of countries) {
        let data = [];
        let tot_nominees = 0;
        for (let year = 1901; year < 1967 + 1; year++) {
            let n_nominees = 0;
            for (let cate of categories)
                n_nominees += country_data[country][year][cate].length;
            data.push(n_nominees);
            tot_nominees += n_nominees;
        }
        let visible = tot_nominees > 500;
        series_.push({
            name: country,
            data: data,
            visible: visible,
            n_nomi: tot_nominees
        });
    }
    series_.sort((a, b) => b.n_nomi - a.n_nomi);
    series = series_.map(item => ({
        name: item.name,
        data: item.data,
        visible: item.visible
    }));
    return series;
};
const country_info_data_transformer = function(country_data) {
    let categories = [
        "medicine",
        "chemistry",
        "physics",
        "literature",
        "peace"
    ];
    let series = [];
    for (let cate of categories) {
        series.push({
            name: cate,
            data: []
        });
    }

    for (let cate of categories) {
        let cate_id = categories.indexOf(cate);
        for (let year = 1901; year < 1967 + 1; year++)
            series[cate_id].data.push(country_data[year][cate].length);
    }

    for (let year = 1954; year < 1967 + 1; year++) {
        series[categories.indexOf("medicine")].data[year - 1901] = null;
    }

    let x_labels = [];
    for (let year = 1901; year < 1967 + 1; year++)
        x_labels.push(year.toString());

    return {
        series: series,
        categories: x_labels
    };
};
const render_name_list = function(nominee_names, people_data, nomination_data) {
    let header = "<table>",
        footer = "</table>",
        content = "";
    for (let name of nominee_names) {
        let person_data = people_data[name];
        content += "<tr><td>" + name + "</td></tr>";
    }
    return header + content + footer;
};
const person_info_data_transformer = function(
    name_list,
    people_data,
    nomination_data
) {
    let series_ = [];
    for (let name of name_list) {
        let person_data = people_data[name];
        let accumulated_nomi = Array(1967 - 1901 + 1).fill(0);
        for (let nominee_idx of person_data["AsNominee"]) {
            let nomination = nomination_data[nominee_idx];
            let year = parseInt(nomination["nomination_info"][0]["Year"]);
            accumulated_nomi[year - 1901] += 1;
        }
        let non_accu_nomi = accumulated_nomi.slice();
        for (let i = 1; i < accumulated_nomi.length; i++)
            accumulated_nomi[i] += accumulated_nomi[i - 1];
        series_.push({
            name: name,
            data: accumulated_nomi,
            non_accu: non_accu_nomi,
            accu: accumulated_nomi.slice()
        });
    }
    series_.sort(
        (a, b) => b.data[b.data.length - 1] - a.data[a.data.length - 1]
    );
    if (series_.length > 6) {
        for (let i = 6; i < series_.length; i++) {
            series_[i].visible = false;
        }
    }

    let categories = [];
    for (let year = 1901; year < 1967 + 1; year++)
        categories.push(year.toString());

    return {
        categories: categories,
        series: series_
    };
};
function timeline_data_transformer(nomination_data, person_data) {
    function format_namelist(name_list) {
        if (name_list.length === 0) return "None";
        else return name_list.join(", ");
    }

    const as_nominator = person_data["AsNominator"],
        as_nominee = person_data["AsNominee"];
    let timeline_data = [];
    for (let nominator_idx of as_nominator) {
        const nomination = nomination_data[nominator_idx];
        timeline_data.push({
            name:
                "<u><b>As nominator</u></b><br/>" +
                `<b>Category:</b> \t\t${
                    nomination["nomination_info"][0]["Category"]
                }<br/>` +
                `<b>Nominated:</b><i> \t\t${format_namelist(
                    nomination["nominee_info"]
                )}<i>`,
            date: nomination["nomination_info"][0]["Year"] + "-01-01T08:00:00",
            series: "Series1",
            extra: {
                nomination_index: nominator_idx
            }
        });
    }

    let year_nominee_count = Array(1967 - 1901 + 1).fill(0);
    for (let nominee_idx of as_nominee) {
        const nomination = nomination_data[nominee_idx];
        let year = parseInt(nomination["nomination_info"][0]["Year"]);
        year_nominee_count[year - 1901] += 1;
    }
    for (let nominee_idx of as_nominee) {
        const nomination = nomination_data[nominee_idx];
        timeline_data.push({
            name:
                "<u><b>As nominee</u></b><br/>" +
                `<b>Category:</b> \t\t${
                    nomination["nomination_info"][0]["Category"]
                }<br/>` +
                `<b>Nominated by:</b><i> \t\t${format_namelist(
                    nomination["nominator_info"]
                )}</i>`,
            date: nomination["nomination_info"][0]["Year"] + "-01-01T08:00:00",
            series: "Series2",
            radius:
                year_nominee_count[
                    parseInt(nomination["nomination_info"][0]["Year"]) - 1901
                ] /
                    6 +
                4,
            extra: {
                nomination_index: nominee_idx
            }
        });
    }
    return timeline_data;
}
const render_person_facts = function(name, person_data) {
    d3.select("#name").html(`${name}<br/>——`);
    d3.select("#person-facts").html(`<table>
                <tr><th align="left">Profession</th><td align="right">&nbsp;&nbsp;${
                    person_data["Profession"] === null
                        ? "-"
                        : person_data["Profession"]
                }</td></tr>
                <tr><th align="left">Motivation</th><td align="right">&nbsp;&nbsp;${
                    person_data["Motivation"] === null
                        ? "-"
                        : person_data["Motivation"]
                }</td></tr>
                <tr><th align="left">University</th><td align="right">&nbsp;&nbsp;${
                    person_data["University"] === null
                        ? "-"
                        : person_data["University"]
                }</td></tr>
                <tr><th align="left">Department</th><td align="right">&nbsp;&nbsp;${
                    person_data["Department"] === null
                        ? "-"
                        : person_data["Department"]
                }</td></tr>
                <tr><th align="left">City</th><td align="right">&nbsp;&nbsp;${
                    person_data["City"] === null ? "-" : person_data["City"]
                }</td></tr>
                <tr><th align="left">Country</th><td align="right">&nbsp;&nbsp;${
                    person_data["Country"] === null
                        ? "-"
                        : person_data["Country"]
                }</td></tr>
                <tr><th align="left">Year, Birth</th><td align="right">&nbsp;&nbsp;${
                    person_data["Year, Birth"] === null
                        ? "-"
                        : person_data["Year, Birth"]
                }</td></tr>
                <tr><th align="left">Year, Death</th><td align="right">&nbsp;&nbsp;${
                    person_data["Year, Death"] === null
                        ? "-"
                        : person_data["Year, Death"]
                }</td></tr>
                <tr><th align="left">Gender</th><td align="right">&nbsp;&nbsp;${
                    person_data["Gender"] === null ? "-" : person_data["Gender"]
                }</td></tr>
            </table>`);
};
const init_person_facts = function() {
    d3.select("#name").html(`Yicheng Jin & Zibo Ye<br/>——`);
    d3.select("#person-facts").html(`<table>
                <tr><th align="left">Profession</th><td align="right">&nbsp;&nbsp;
                    -
                </td></tr>
                <tr><th align="left">Motivation</th><td align="right">&nbsp;&nbsp;
                    mystery
                </td></tr>
                <tr><th align="left">University</th><td align="right">&nbsp;&nbsp;
                    Peking&nbsp;University
                </td></tr>
                <tr><th align="left">Department</th><td align="right">&nbsp;&nbsp;
                    Yuanpei&nbsp;College
                </td></tr>
                <tr><th align="left">City</th><td align="right">&nbsp;&nbsp;
                    Beijing
                </td></tr>
                <tr><th align="left">Country</th><td align="right">&nbsp;&nbsp;
                    China
                </td></tr>
                <tr><th align="left">Year, Birth</th><td align="right">&nbsp;&nbsp;
                    1998
                </td></tr>
                <tr><th align="left">Year, Death</th><td align="right">&nbsp;&nbsp;
                    2019.1.20
                </td></tr>
                <tr><th align="left">Gender</th><td align="right">&nbsp;&nbsp;
                    M/W/?
                </td></tr>
            </table>`);
};
const render_person_network = function(
    name,
    nomination_data,
    people_data,
    country_data
) {};
const render_person_timeline = function(
    name,
    nomination_data,
    people_data,
    country_data
) {
    let person_data = people_data[name];
    let timeline_data = timeline_data_transformer(nomination_data, person_data);
    d3.select("#person-timeline").html("");
    TimeKnots.draw("#person-timeline", timeline_data, {
        horizontalLayout: true,
        color: "#669",
        height: 200,
        width: parseInt(d3.select("#person-timeline").style("width")),
        showLabels: false,
        dateFormat: "%Y",
        lineWidth: 2,
        radius: 8
    });

    const render_hyperlink_name_list = function(name_list) {
        let hyperlinks = [];
        for (let name of name_list)
            hyperlinks.push(
                `<a onclick="jump_to_person('${name}')">${name}<\a>`
            );
        return hyperlinks.join(", ");
    };

    const render_nomination_info = function(nomination_index, nomination_data) {
        let nomi_data = nomination_data[nomination_index.toString()];
        d3.select("#nomination-info").html(`<table>
                <tr><th align="left">Year</th><td align="right">&nbsp;&nbsp;${
                    nomi_data["nomination_info"][0]["Year"] === null
                        ? "-"
                        : nomi_data["nomination_info"][0]["Year"]
                }</td></tr>
                <tr><th align="left">Category</th><td align="right">&nbsp;&nbsp;${
                    nomi_data["nomination_info"][0]["Category"] === null
                        ? "-"
                        : nomi_data["nomination_info"][0]["Category"]
                }</td></tr>
                <tr><th align="left">Nominators</th><td align="right">&nbsp;&nbsp;${render_hyperlink_name_list(
                    nomi_data["nominator_info"]
                )}</td></tr>
                <tr><th align="left">Nominees</th><td align="right">&nbsp;&nbsp;${render_hyperlink_name_list(
                    nomi_data["nominee_info"]
                )}</td></tr>
                </table>`);
    };

    d3.selectAll("#person-timeline > svg > circle").on("click", function(d) {
        render_nomination_info(d.extra.nomination_index, nomination_data);
    });
};
let nomination_data_, people_data_, country_data_, spline_chart_;
const jump_to_person = function(name) {
    render_person_facts(name, people_data_[name]);
    render_person_timeline(name, nomination_data_, people_data_, country_data_);
    let person_info_data = person_info_data_transformer(
        [name],
        people_data_,
        nomination_data_
    );
    for (let series of spline_chart_.series) series.remove(false);
    for (let data of person_info_data.series)
        spline_chart_.addSeries(data, false);
    spline_chart_.redraw();
};
require(["./load_data"], function() {
    fetch_data_and_viz(viz_data_3);
});
let viz_data_3 = function(nomination_data, people_data, country_data) {
    nomination_data_ = nomination_data;
    people_data_ = people_data;
    country_data_ = country_data;
    let line_plot_data = line_plot_data_transformer(country_data);
    let init_country_info_data = country_info_data_transformer(
        country_data["UNITED STATES (US) "]
    );
    let init_person_info_data = person_info_data_transformer(
        ["Gaston Ramon"],
        people_data,
        nomination_data
    );
    let current_info_country = "UNITED STATES (US) ";
    let accumulation_view = true;
    let line_chart = Highcharts.chart("container", {
        chart: {
            type: "spline",
            style: {
                fontFamily: "Open Sans"
            },
            zoomType: "x"
        },
        title: {
            text: "Nobel prize nomination by Country, 1901-1967",
            align: "left"
        },
        subtitle: {
            text: "Source: https://www.nobelprize.org/",
            align: "left"
        },
        yAxis: {
            title: {
                text: "Number of Nominees"
            }
        },
        tooltip: {
            valueSuffix: " people"
        },
        plotOptions: {
            series: {
                marker: {
                    enabled: false
                },
                label: {
                    connectorAllowed: false
                },
                pointStart: 1901,
                events: {
                    click: function(event) {
                        let country_name = event.point.series.name;
                        current_info_country = country_name;
                        let country_info_data = country_info_data_transformer(
                            country_data[country_name]
                        );
                        stack_chart.setTitle({
                            text: `# Nominee by Category [${country_name}]`,
                            align: "left"
                        });
                        for (let i = 0; i < 5; i++) {
                            stack_chart.series[i].setData(
                                country_info_data.series[i].data,
                                false
                            );
                        }
                        stack_chart.redraw();
                    }
                }
            }
        },
        series: line_plot_data,
        responsive: {
            rules: [
                {
                    condition: {
                        maxWidth: 1400
                    },
                    chartOptions: {
                        legend: {
                            layout: "vertical",
                            align: "right",
                            verticalAlign: "bottom",
                            x: 20,
                            width: "20%",
                            maxHeight:
                                0.8 *
                                parseInt(
                                    d3.select("#container").style("height")
                                )
                        }
                    }
                }
            ]
        },
        credits: {
            enabled: false
        },
        exporting: {
            enabled: false
        }
    });
    let stack_chart = Highcharts.chart("country-info", {
        chart: {
            type: "area",
            style: {
                fontFamily: "Open Sans"
            },
            zoomType: "x"
        },
        legend: {
            align: "right",
            layout: "vertical",
            verticalAlign: "middle",
            width: "18%"
        },
        title: {
            text: "# Nominee by Category [UNITED STATES (US) ]",
            align: "left"
        },
        subtitle: {
            text: "Source: https://www.nobelprize.org/",
            align: "left"
        },
        xAxis: {
            categories: init_country_info_data.categories,
            tickmarkPlacement: "on",
            title: {
                enabled: false
            }
        },
        yAxis: {
            title: {
                text: "# Nominee"
            },
            labels: {
                formatter: function() {
                    return this.value;
                }
            }
        },
        tooltip: {
            share: true,
            valueSuffix: " people"
        },
        plotOptions: {
            series: {
                marker: {
                    enabled: false
                },
                events: {
                    click: function(event) {
                        let year = event.point.category;
                        let category = event.point.series.name;
                        let nominee_names =
                            country_data[current_info_country][parseInt(year)][
                                category
                            ];
                        let person_info_data = person_info_data_transformer(
                            nominee_names,
                            people_data,
                            nomination_data
                        );
                        let n_series = spline_chart.series.length;
                        spline_chart.setTitle({
                            text: `Nominee information [${category}]`
                        });
                        for (let i = n_series - 1; i > -1; i--)
                            spline_chart.series[i].remove(false);
                        for (let data of person_info_data.series)
                            spline_chart.addSeries(data, false);
                        spline_chart.redraw();
                    }
                }
            },
            area: {
                stacking: "normal",
                lineColor: "#666666",
                lineWidth: 0,
                marker: {
                    lineWidth: 1,
                    lineColor: "#666666"
                }
            }
        },
        series: init_country_info_data.series,
        credits: {
            enabled: false
        },
        exporting: {
            enabled: false
        }
    });
    const toggle_accumulation = function(name, series) {
        for (let i = series.length - 1; i > 0; i--) series[i] -= series[i - 1];
        return {
            name: name,
            data: series
        };
    };
    let spline_chart = Highcharts.chart("person-info", {
        chart: {
            type: "spline",
            style: {
                fontFamily: "Open Sans"
            },
            zoomType: "x"
        },
        title: {
            text: "Nominee information [medicine]",
            align: "left"
        },
        legend: {
            layout: "vertical",
            align: "right",
            verticalAlign: "bottom",
            width: "18%",
            maxHeight: 0.7 * parseInt(d3.select("#person-info").style("height"))
        },
        xAxis: {
            categories: init_person_info_data.categories
        },
        yAxis: {
            title: {
                text: "# Nomination"
            }
        },
        tooltip: {
            shared: true,
            valueSuffix: " times"
        },
        credits: {
            enabled: false
        },
        plotOptions: {
            series: {
                marker: {
                    enabled: false
                },
                events: {
                    click: function(event) {
                        let name = event.point.series.name;
                        render_person_facts(name, people_data[name]);
                        render_person_timeline(
                            name,
                            nomination_data,
                            people_data,
                            country_data
                        );
                    }
                }
            },
            areaspline: {
                fillOpacity: 0.5,
                lineWidth: 0
            }
        },
        series: init_person_info_data.series,
        exporting: {
            enabled: true
        }
    });
    spline_chart.update({
        exporting: {
            buttons: {
                switchView: {
                    text: "Toggle Accumulation",
                    onclick: function() {
                        for (let series of spline_chart.series)
                            series.setData(
                                series.userOptions[
                                    accumulation_view ? "non_accu" : "accu"
                                ],
                                false
                            );
                        accumulation_view = !accumulation_view;
                        spline_chart.redraw();
                    }
                }
            }
        }
    });
    spline_chart_ = spline_chart;
    init_person_facts();
};
