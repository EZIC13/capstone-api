import requests

#Array for the countries to be added to
pulledCountries = []

#Connect to the API
countries = requests.get(f"https://restcountries.com/v3.1/all").json()

#Parse through API results
for y in countries:

    #Don't add hong kong and macau (due to keyerrors/missing data)
    if y["name"]["common"] == "Macau" or y["name"]["common"] == "Hong Kong":
        continue

    try:
        y_longitude = y["capitalInfo"]["latlng"][1]
        y_latitude = y["capitalInfo"]["latlng"][0]
    except:
        y_longitude = y["latlng"][1]
        y_latitude = y["latlng"][0]

    y_name_common = y["name"]["common"]

    y_name_official = y["name"]["official"]

    y_flag = y["flags"]["png"]

    y_region = y["region"]

    try:
        y_subregion = y["subregion"]
    except:
        y_subregion = y_region

    try:
        y_capital = y["capital"][0]
    except:
        y_capital = "N/A"

    #Landlocked boolean must be 0 or 1 for mysql, the api will reconvert back to a boolean when parsing
    if y["landlocked"] == True: 
        y_landlocked = 1
    else:
        y_landlocked = 0

    y_area = y["area"]

    y_population = y["population"]

    try:
        if y["demonyms"]["eng"]["f"] == y["demonyms"]["eng"]["m"]:
            y_demonym = y["demonyms"]["eng"]["m"]
        else:
            y_demonym = f'{y["demonyms"]["eng"]["m"]} (Male), {y["demonyms"]["eng"]["f"]} (Female)'
    except:
        y_demonym = "N/A"

    #Country instance
    country = {
        "coordinates": {
            "longitude": y_longitude,
            "latitude": y_latitude
        },
        "name_common": y_name_common,
        "name_official": y_name_official,
        "flag": y_flag,
        "region": y_region,
        "subregion": y_subregion,
        "capital": y_capital,
        "landlocked": y_landlocked,
        "area": y_area,
        "population": y_population,
        "demonym": y_demonym 
    }

    pulledCountries.append(country)
    #print(f'Pulled {y["name"]["common"]}')

#Sort in alphabetical order
finalList = sorted(pulledCountries, key = lambda d: d["name_common"])

#Send data to API
LOCAL_URL = 'http://localhost:3000/countriesPOST'
x = requests.post(LOCAL_URL, json = finalList)
print(f'Status code: {x.status_code}\nResponse: {x.text}')