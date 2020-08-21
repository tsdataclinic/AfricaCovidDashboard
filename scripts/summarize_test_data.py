import pandas as pd 
from pathlib import Path

summary_strings = []
for f in Path('../data/raw/test').glob('*.csv'):
    data = pd.read_csv(f)
    table_sample = data.sample(10).to_markdown()
    dataset_summary = data.describe().to_markdown()
    filename = f.name
    print(filename)
    summary=f"""
## {filename}
### Table snapshot 
{table_sample}

### Dataset summary 
{dataset_summary}
"""
    summary_strings.append(summary)

joined_summary_strings = '\n'.join(summary_strings)
markdown_str=f"""
# Test data summary

This data is from a test run from the model and serves
to give an example of what we can expect when we run 
the model

{joined_summary_strings}

"""

with open('../data/raw/test/summary.md','w') as f:
    f.write(markdown_str)