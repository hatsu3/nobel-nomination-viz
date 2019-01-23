
# coding: utf-8

# In[ ]:


import json
from pathlib import Path

import bs4
import requests
import numpy as np
import pandas as pd
from tqdm import tqdm
import matplotlib.pyplot as plt
from fuzzywuzzy import fuzz, process


# In[ ]:


winners = pd.read_csv('data/dataset/archive.csv')
nominee = pd.read_json('data/dataset/people.json').T
people = json.load(open('people.json', 'r'))


# In[ ]:


nomination_htmls = get_ipython().getoutput('ls data/dataset/raw/nomination/')
nomination_htmls = sorted(nomination_htmls, key=(lambda x: int(x[:-5])))
print(len(nomination_htmls))


# In[ ]:


nomination_json = dict()

for i in tqdm(range(len(nomination_htmls))):
    try:
        html_path = './raw/nomination/' / Path(nomination_htmls[i])
        html = html_path.read_text()
        soup = bs4.BeautifulSoup(html)
        rows = soup.body.find('table').select('tr')

        nominee_start_indices = []
        nominator_start_indices = []
        for j, row in enumerate(rows):
            tds = row.findChildren('td')
            if tds[0].text.startswith('Nominee'):
                nominee_start_indices.append(j)
            elif tds[0].text.startswith('Nominator'):
                nominator_start_indices.append(j)

        delim_indices = nominee_start_indices + nominator_start_indices
        delim_indices = [0, *delim_indices, None]

        nomination_info = []
        nominee_info = []
        nominator_info = []

        for j in range(len(delim_indices)-1):
            start, end = delim_indices[j:j+2]

            parsed_dict = dict()
            for row in rows[start+1:end]:
                tds = row.findChildren('td')
                if len(tds) == 1:
                    category = tds[0].text.replace('Nomination for ', '')
                    if category == '\xa0':
                        continue
                    parsed_dict['Category'] = category
                    continue
                key = tds[0].text.replace(':', '')
                value = tds[1].text.replace('\xa0', ' ')
                parsed_dict[key] = value

            head = rows[start].findChildren('td')[0].text
            if head.startswith('Nominee'):
                nominee_info.append(parsed_dict)
            elif head.startswith('Nominator'):
                nominator_info.append(parsed_dict)
            else:
                nomination_info.append(parsed_dict)

        nomination_json[i+1] = {
            'nomination_info': nomination_info,
            'nominator_info': nominator_info,
            'nominee_info': nominee_info,
        }
    except IndexError:
        print(f'IndexError in {html_path}')
    except AttributeError:
        print(f'AttributeError in {html_path}')
        
json.dump(nomination_json, open('nomination.json', 'w'))


# In[ ]:


excluded = sorted(list(set(range(1, 20000)) - set(nomination_json.keys())))
json.dump(excluded, open('nomination_excluded.json', 'w'))


# In[ ]:


no_nominator_or_nominee = [k for k, v in nomination_json.items() 
                           if not v['nominator_info'] or not v['nominee_info']]

for k in no_nominator_or_nominee:
    try:
        if 'invalid' not in nomination_json[k]['nomination_info'][0]['Motivation']:
            print(k)
    except KeyError:
        print('KeyError in', k)


# In[ ]:


people = dict()
people_list = []

for k, v in nomination_json.items():
    nominators = v['nominator_info']
    nominees = v['nominee_info']
    all_people = nominators + nominees
    for person in all_people:
        people_list.append(person['Name'])
        people[person['Name']] = person

print(len(people_list) - len(set(people_list)))

for name, person in people.items():
    del people[name]['Name']
    
attributes = set()
for name, person in people.items():
    attributes |= set(person.keys())
    
for name, person in people.items():
    for attr in attributes:
        if not attr in person:
            people[name][attr] = None
            
json.dump(people, open('people_2.json', 'w'))


# In[ ]:


for key, nomi in nomination_json.items():
    nomination_json[key]['nominator_info'] = [x['Name'] for x in nomi['nominator_info']]
    nomination_json[key]['nominee_info'] = [x['Name'] for x in nomi['nominee_info']]
    
for k in set(no_nominator_or_nominee) - set(no_nominator):
    try: del nomination_json[str(k)]
    except KeyError: pass
    
json.dump(nomination_json, open('nomination_2.json', 'w'))


# In[ ]:


people_countries = set(x['Country'] for x in people_.values())
people_country_json = {country:[] for country in people_countries}

for name, person in people_.items():
    people_country_json[person['Country']].append(name)

json.dump(people_country_json, open('people_country.json', 'w'))


# In[ ]:


def fetch_category(idx):
    soup = bs4.BeautifulSoup(Path(f'raw/nomination/{idx}.html').read_text())
    return soup.select('td')[0].text.replace('Nomination for ', '')

def clean_name(name):
    return ' '.join(name.split()).strip()


# In[ ]:


for key, nomi in nomination_json.items():
    nomination_json[key]['nomination_info'][0]['Category'] = fetch_category(key)
    for i, person in enumerate(nomination_json[key]['nominator_info']):
        nomination_json[key]['nominator_info'][i] = clean_name(person)
    for i, person in enumerate(nomination_json[key]['nominee_info']):
        nomination_json[key]['nominee_info'][i] = clean_name(person)
        
json.dump(nomination_json, open('nomination_2.json', 'w'))


# In[ ]:


years = list(set(x['nomination_info'][0]['Year'] for x in nomination_json.values()))
years = sorted([int(x) for x in years])

nomination_per_year_json = {year:[] for year in years}

for key, nomi in nomination_json.items():
    year = int(nomi['nomination_info'][0]['Year'])
    nomination_per_year_json[year].append(key)

json.dump(nomination_per_year_json, open('nomination_per_year.json', 'w'))


# In[ ]:


for name, person in people.items():
    people[name]['AsNominator'] = []
    people[name]['AsNominee'] = []

for key, nomi in nomination_json.items():
    for p in nomi['nominator_info']:
        people[p]['AsNominator'].append(key)
    for p in nomi['nominee_info']:
        people[p]['AsNominee'].append(key)


# In[ ]:


winners = pd.read_csv('./data/dataset/archive.csv')

winners_names = winners[winners.Year <= 1967].iloc[:, 7]
people_names = np.fromiter(people.keys(), '<U128')
match_short_names = []
matches_short_names = []
bad_matches = []
max_scores = []

pbar = tqdm.tqdm(total=len(winners_names))
for winner_name in winners_names:
    scores = [fuzz.ratio(person_name, winner_name) for person_name in people.keys()]
    scores = np.array(scores)
    max_scores.append(np.max(scores))
    best_match = people_names[np.max(scores)]
    match_short_names.append((winner_name, best_match))
    best_matches = people_names[np.argsort(scores)[-5:][::-1]]
    matches_short_names.append((winner_name, best_matches))
    pbar.update(1)

bad_matches = [(name, score, matches[1]) for name, score, matches 
               in zip(winners_names, max_scores, matches_short_names) 
               if 50 <= score <= 60]


# In[ ]:


n_entries = (1967-1914+1) * len(categories)
pbar = tqdm.tqdm(total=n_entries)
for year in range(1914, 1967+1):
    for cate in categories:
        pbar.update(1)
        summary_url = f'https://www.nobelprize.org/prizes/{cate}/{year}/summary'
        summary_html = requests.get(summary_url).text
        Path(f'data/nobel_award/summary/{cate}_{year}_summary.html').write_text(summary_html)
        summary_soup = bs4.BeautifulSoup(summary_html)
        fact_urls = [anchor.attrs['href'] 
                     for anchor in summary_soup.select(
                         'a[title="Title text"]')]
        if not fact_urls:
            winners_json[year][cate] = None
            print(f'No {cate} Award in {year}')
            continue
        fact_url = fact_urls[0]
        fact_html = requests.get(fact_url).text
        Path(f'data/nobel_award/facts/{cate}_{year}_fact.html').write_text(fact_html)
        fact_soup = bs4.BeautifulSoup(fact_html)
        name_spans = fact_soup.select('span[itemprop="name"]')
        names = [' '.join(span.text.strip().split()) for span in name_spans]
        
        winners_json[year][cate] = names


# In[ ]:


for key, nomi in nomination_json.items():
    cate = nomi['nomination_info'][0]['Category']
    cate = cate.split()[-1].lower()
    if cate == 'prize':
        cate = 'peace'
    nomination_json[key]['nomination_info'][0]['Category'] = cate
    
json.dump(nomination_json, open('data/dataset/nomination_2.json', 'w'))


# In[ ]:


n_nomis = []
for name, person in people.items():
    n_nomi = len(person['AsNominator'] + person['AsNominee'])
    n_nomis.append(n_nomi)
    
json.dump(people, open("data/dataset/people.json", 'w'))


# In[ ]:


countries = list(set(person['Country'] for person in people.values()))
country_nomination_json = {}

for country in countries:
    country_nomination_json[country] = dict()

for country in countries:
    for year in range(1901, 1967+1):
        country_nomination_json[country][year] = dict()

for country in countries:
    for year in range(1901, 1967+1):
        for cate in categories:
            country_nomination_json[country][year][cate] = set()

pbar = tqdm.tqdm(len(nomination_json))
for key, nomi in nomination_json.items():
    pbar.update(1)
    cate = nomi['nomination_info'][0]['Category']
    year = int(nomi['nomination_info'][0]['Year'])
    for nominee_name in nomi['nominee_info']:
        country = people[nominee_name]['Country']
        if country is None:
            continue
        country_nomination_json[country][year][cate].add(nominee_name)

for country in countries:
    for cate in categories:
        for year in range(1901, 1967+1):
            country_nomination_json[country][year][cate] = list(country_nomination_json[country][year][cate])

json.dump(country_nomination_json, open('data/dataset/people_country.json', 'w'))

