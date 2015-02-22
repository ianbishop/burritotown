import pandas as pd
# from pandas import Series
from pandas import DataFrame
# import numpy as np

# Load all the data
city_income_demographics = DataFrame.from_csv("./SourceData/01110004-eng.csv",
                                              parse_dates=False)
# Get just the 2012 data
in_dem_2012 = city_income_demographics[city_income_demographics.index == 2012]

# Get only the city data
in_dem_2012_city = in_dem_2012[pd.notnull(in_dem_2012['Geographical classification'])]
# Get rid of unnecessary columns
in_dem_2012_city = in_dem_2012_city.drop(['Coordinate', 'Vector'], 1)

city_name_number = in_dem_2012_city[['GEO', 'Geographical classification']]
city_name_number = city_name_number.drop_duplicates()

# Set up an array to hold the percent income in each bracket
income_brackets = ['Inc0to15',
                   'Inc15to25',
                   'Inc25to35',
                   'Inc35to50',
                   'Inc50to75',
                   'Inc75to100',
                   'Inc100up']

age_brackets = ['Age0to24',
                'Age25to44',
                'Age45to64',
                'Age65up']

# Grab all of the unique locations
locations = set(in_dem_2012_city['Geographical classification'])
# Calculate relevant statistics for each city
location_data = {}
for location in locations:
    name = city_name_number[city_name_number['Geographical classification'] == location]
    name = name['GEO'][2012]
    location_data[name] = {}
    # Take a subset of data for a given city
    subset = in_dem_2012_city[in_dem_2012_city['Geographical classification'] == location]
    # Get the total number of tax filers in that area
    taxpayers = subset[subset['DON'] == 'Number of taxfilers']
    taxpayers = float(taxpayers['Value'].values[0])
    # Get all the rows that relate to income
    income_percents = {}
    income_rows = subset[subset['DON'].str.contains("Percentage of persons with total")]
    income_rows.reset_index(inplace=True)
    i = 0
    for income_bracket in income_brackets:
        if income_bracket == 'Inc0to15':
            try:
                percent = float(income_rows.iloc[[i]]['Value'][0])
            except:
                percent = 0
            income_percents[income_bracket] = 100 - percent
        elif income_bracket == 'Inc100up':
            try:
                percent = float(income_rows.iloc[[i - 1]]['Value'])
            except:
                percent = 0
            income_percents[income_bracket] = percent
        else:
            try:
                high = float(income_rows.iloc[[i]]['Value'])
                low = float(income_rows.iloc[[i - 1]]['Value'])
                percent = low - high
            except:
                percent = 0
            income_percents[income_bracket] = percent
        i += 1
    for k, v in income_percents.iteritems():
        location_data[name][k] = int(v * taxpayers / 100)
        location_data[name][k + 'percent'] = v
    age_rows = subset[subset['DON'].str.contains("Percentage of persons aged")]
    age_rows.reset_index(inplace=True)
    j = 0
    for age_bracket in age_brackets:
        percent = float(age_rows.iloc[[j]]['Value'])
        location_data[name][age_bracket] = int(percent * taxpayers / 100)
        location_data[name][age_bracket + 'percent'] = v
        j += 1
    # Add a column for the median income for each town and city
    median_inc = subset[subset['DON'].str.contains("Median employment income, both")]
    median_inc.reset_index(inplace=True)
    income = float(median_inc['Value'][0])
    location_data[name]['Median Income'] = income

    # Add a column for median age
    median_age = subset[subset['DON'].str.contains("Average age of persons")]
    median_age.reset_index(inplace=True)
    age = float(median_age['Value'][0])
    location_data[name]['Median Age'] = age

location_dataframe = DataFrame(location_data).T
location_dataframe.to_csv(path_or_buf="./CityData.csv")
