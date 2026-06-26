import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import statsmodels.api as sm
import statsmodels.formula.api as smf
from statsmodels.stats.anova import anova_lm

# ---------------------------------------------------------------
# STEP 1: Load and clean data
# ---------------------------------------------------------------
file_path = "C:/Users/Samiksha/Downloads/L9_BlackScholes(final)(1).xlsx"   

df = pd.read_excel(file_path,sheet_name="Sheet3", header=0)

# Renaming columns 
df = df.rename(columns={'So': 'S', 'BS': 'Call'})

# Converting columns to numeric and drop non-numeric columns
for col in ['S', 'K', 'r', 'sigma', 'Call']:
    df[col] = pd.to_numeric(df[col], errors='coerce')

# Remove rows where conversion failed
df = df.dropna(subset=['S', 'K', 'r', 'sigma', 'Call']).reset_index(drop=True)

# ---------------------------------------------------------------
# STEP 4: ANOVA table (Type II)
# ---------------------------------------------------------------
formula = "Call ~ S + K + r + sigma"
model = smf.ols(formula, data=df).fit()
anova_results = anova_lm(model, typ=2)
print("\n--- ANOVA Table (Type II) ---")
print(anova_results)

# Percentage contribution
ss_total = anova_results['sum_sq'].sum()
anova_results['Percentage'] = (anova_results['sum_sq'] / ss_total) * 100  #percent=(SS due to factors/total SS)*100
print("\n--- Percentage Contribution ---")
print(anova_results[['sum_sq', 'Percentage']])

anom_results = {}

for factor in ['S', 'K', 'r', 'sigma']:
    # Mean Call at each level of the factor
    means = df.groupby(factor)['Call'].mean().reset_index()
    means = means.rename(columns={'Call': 'Mean_Call'})
    
    # Calculate Delta (Effect Size)
    delta = means['Mean_Call'].max() - means['Mean_Call'].min()
    
    # Store results
    anom_results[factor] = {
        'means_table': means,
        'delta': delta
    }

# Display ANOM tables
print("\n--- ANOM (Means at Each Level) ---")
for f in anom_results:
    print(f"\nFactor: {f}")
    print(anom_results[f]['means_table'])
    print(f"Δ (Delta) = {anom_results[f]['delta']:.4f}")

# Rank factors by Delta
rank_df = pd.DataFrame({
    'Factor': list(anom_results.keys()),
    'Delta': [anom_results[f]['delta'] for f in anom_results]
})

rank_df = rank_df.sort_values(by='Delta', ascending=False).reset_index(drop=True)
rank_df['Rank'] = rank_df.index + 1

print("\n--- Factor Ranking Based on ANOM (using Δ) ---")
print(rank_df)