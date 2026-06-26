# ===============================================================
#   Continuous Multiple Regression, ANOVA, and Diagnostics
#   Model form: Call = a + b1*S + b2*K + b3*r + b4*sigma
# ===============================================================

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import statsmodels.api as sm
import statsmodels.formula.api as smf
from statsmodels.stats.anova import anova_lm

# ---------------------------------------------------------------
# STEP 1: Load and clean data
# ---------------------------------------------------------------
file_path = "C:/Users/Samiksha/Downloads/All3Months.xlsx"   

df = pd.read_excel(file_path,sheet_name="Sheet3", header=0)

# Renaming columns 
df = df.rename(columns={'So': 'S', 'BS': 'Call'})

# Converting columns to numeric and drop non-numeric columns
for col in ['S', 'K', 'r', 'sigma', 'Call']:
    df[col] = pd.to_numeric(df[col], errors='coerce')

# Remove rows where conversion failed
df = df.dropna(subset=['S', 'K', 'r', 'sigma', 'Call']).reset_index(drop=True)

# ---------------------------------------------------------------
# STEP 2: Fit continuous multiple linear regression
# ---------------------------------------------------------------
formula = "Call ~ S + K + r + sigma"
model = smf.ols(formula, data=df).fit() #this creates the model - Call=a+b1​S+b2​K+b3​r+b4​σ

# Regression summary
print("\n--- Regression Summary ---")
print(model.summary()) #Prints regression results

# ---------------------------------------------------------------
# STEP 3: Regression equation
# ---------------------------------------------------------------
params = model.params
print("\n--- Regression Equation ---")
print(f"Call = {params.iloc[0]:.4f} + {params.iloc[1]:.4f}*S + {params.iloc[2]:.4f}*K + {params.iloc[3]:.4f}*r + {params.iloc[4]:.4f}*sigma")
# ---------------------------------------------------------------
# STEP 4: ANOVA table (Type II)
# ---------------------------------------------------------------
anova_results = anova_lm(model,typ=2)
print("\n--- ANOVA Table (Type II) ---")
print(anova_results)

# ---------------------------------------------------------------
# STEP 4 (continued): Add Ranking Based on Percentage Contribution
# ---------------------------------------------------------------



# Percentage contribution 
ss_total = anova_results['sum_sq'].sum() 
anova_results['Percentage'] = (anova_results['sum_sq'] / ss_total) * 100 
#percent=(SS due to factors/total SS)*100 
print("\n--- Percentage Contribution ---") 
print(anova_results[['sum_sq', 'Percentage']])



# ---------------------------------------------------------------
# STEP 5: Model Diagnostics and Plots
# ---------------------------------------------------------------
# ===============================================================
# Combined Residual Diagnostic Plots (Your Code, One Figure)
# ===============================================================

resid = model.resid
fitted = model.fittedvalues

fig, axes = plt.subplots(2, 2, figsize=(12, 8))

# Q-Q Plot (normality)
sm.ProbPlot(resid).qqplot(line='45', ax=axes[0,0], marker='o', markerfacecolor='grey', markeredgecolor='grey')
axes[0,0].set_title("Normal Q-Q Plot of Residuals")


# Residuals vs Fitted
axes[0,1].scatter(fitted, resid, color='red') #Residual vs fitted- Checks randomness (linearity + equal variance).
axes[0,1].axhline(0, color='black', linestyle='--')
axes[0,1].set_xlabel("Fitted Values")
axes[0,1].set_ylabel("Residuals")
axes[0,1].set_title("Residuals vs Fitted Values")
axes[0,1].grid(True)

# Histogram of residuals
axes[1,0].hist(resid, bins=8, color='white', edgecolor='red') #Histogram of residuals- Also checks normality shape.
axes[1,0].set_title("Histogram of Residuals")
axes[1,0].set_xlabel("Residual")
axes[1,0].set_ylabel("Frequency")

# Residuals vs Observation Order
axes[1,1].plot(range(len(resid)), resid, marker='o',color="red")
axes[1,1].axhline(0, linestyle='--',color="grey")
axes[1,1].set_xlabel("Observation Order")
axes[1,1].set_ylabel("Residual")
axes[1,1].set_title("Residuals vs Observation Order")

plt.tight_layout()
plt.show()

# ---------------------------------------------------------------
# STEP 6: ANOM - Analysis of Means (Factor Effect Ranking)
# ---------------------------------------------------------------
factors = ['S', 'K', 'r', 'sigma']
num_levels = 3 # Assuming L9 array with 3 levels per factor

anom_deltas = {}
means_matrix = []

# --- Calculate Means and Delta using Positional Levels ---
for factor in factors:
    # 1. Get the unique levels and sort them to maintain consistent Level 1, 2, 3 order
    unique_levels = sorted(df[factor].unique())
    
    # 2. Map the actual factor values to their level index (0, 1, 2)
    level_map = {val: i for i, val in enumerate(unique_levels)}
    
    # 3. Temporarily add the Level index to the DataFrame
    df['Level_Index'] = df[factor].map(level_map)
    
    # 4. Group by the Level Index (0, 1, 2) to get the mean for each Level
    means_series = df.groupby('Level_Index')['Call'].mean()
    
    # 5. Store the means in the matrix (as a list to append)
    means_matrix.append(means_series.tolist())

    # 6. Calculate Delta using the means_series
    delta = means_series.max() - means_series.min()
    anom_deltas[factor] = delta

# Clean up the temporary column
df = df.drop(columns=['Level_Index'])

# --- Construct the Consolidated ANOM Means Table ---
anom_df_means = pd.DataFrame(np.array(means_matrix).T, columns=factors)
anom_df_means.index = [f'Level {i+1}' for i in range(num_levels)]

# --- Create Delta and Rank Rows ---
rank_series = pd.Series(anom_deltas).sort_values(ascending=False)
deltas_row = rank_series.reindex(factors).rename('Delta (Δ)') 
ranks_row = pd.Series(np.arange(1, len(factors) + 1), index=rank_series.index).reindex(factors).rename('Rank')

# --- Final Merge ---
final_anom_df = pd.concat([anom_df_means, deltas_row.to_frame().T, ranks_row.to_frame().T])
final_anom_df.index.name = None # Remove index name for cleaner print

# --- Define custom formatter to handle Ranks as integers ---
def custom_formatter(x):
    # Check if the row index is 'Rank'
    if x.name == 'Rank':
        # Return as integer string
        return pd.Series([f"{val:.0f}" for val in x.values], index=x.index)
    # Check if the row index is 'Delta'
    elif x.name == 'Delta (Δ)':
        # Return Delta as 4 decimal float
        return pd.Series([f"{val:.4f}" for val in x.values], index=x.index)
    else:
        # Return means as 4 decimal float
        return pd.Series([f"{val:.4f}" for val in x.values], index=x.index)

# --- Print Results using the custom formatter ---
print("\n--- Consolidated ANOM Table (Means, Delta, and Rank) ---")
# Apply the custom formatter to each row
print(final_anom_df.apply(custom_formatter, axis=1).to_string(index=True, header=True))
