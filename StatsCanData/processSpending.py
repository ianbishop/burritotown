import pandas as pd
# from pandas import Series
from pandas import DataFrame
# import numpy as np

# Load all the data
spending_data = DataFrame.from_csv("./cansimhouseholdspending2.csv",
                                   parse_dates=False)
# Get rid of unnecessary columns
spending_data = spending_data.drop(['STAT'], 1)

pivot_spending = spending_data.pivot(index='GEO', columns='SUMMARY', values='Value')

pivot_spending.to_csv(path_or_buf="./SpendingData.csv")
