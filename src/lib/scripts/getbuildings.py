#!/usr/bin/env python3

"""
This snippet demonstrates how to access and convert the buildings
data from .csv.gz to geojson for use in common GIS tools. You will
need to install pandas, geopandas, shapely, and requests.
"""

import pandas as pd
import geopandas as gpd
from shapely.geometry import shape
import requests
from io import StringIO, BytesIO
import gzip

def download_file(url):
    """Download a file from a URL and return its content."""
    response = requests.get(url, verify=False)  # Setting verify=False to bypass SSL verification
    response.raise_for_status()  # Check for request errors
    return response.content

def main():
    # This is the name of the geography you want to retrieve. Update to meet your needs
    location = 'Ukraine'

    # URL of the CSV file
    csv_url = "https://minedbuildings.blob.core.windows.net/global-buildings/dataset-links.csv"

    # Fetch and read the CSV file from the URL
    csv_content = download_file(csv_url)
    dataset_links = pd.read_csv(StringIO(csv_content.decode('utf-8')))
    
    # Filter the links for the specified location
    location_links = dataset_links[dataset_links.Location == location]
    
    # Process each URL in the CSV, assuming URLs point to JSON files
    for _, row in location_links.iterrows():
        json_url = row['Url']
        
        # Download the JSON file
        json_content = download_file(json_url)
        
        # Decompress the content if it is gzip-compressed
        try:
            json_content = gzip.decompress(json_content)
        except OSError:
            pass  # If not gzip-compressed, use the content as-is
        
        # Read the JSON file into a DataFrame
        df = pd.read_json(StringIO(json_content.decode('utf-8')), lines=True)
        
        # Convert the 'geometry' column to shapely objects
        df['geometry'] = df['geometry'].apply(shape)
        
        # Create a GeoDataFrame
        gdf = gpd.GeoDataFrame(df, crs="EPSG:4326")
        
        # Save the GeoDataFrame to a GeoJSON file
        gdf.to_file(f"{row.QuadKey}.geojson", driver="GeoJSON")

if __name__ == "__main__":
    main()
