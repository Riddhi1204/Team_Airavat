"""
CivicPulse - Local Population Dataset Setup Helper
This script creates the `local_population_grid` PostGIS table and inserts
sample high-resolution population density grids for local development,
or can be expanded to ingest raster GeoTIFF files from WorldPop.
"""

import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import text
from app.core.database import SessionLocal


def setup_local_population_grid():
    db = SessionLocal()
    try:
        print("Setting up local_population_grid table in PostGIS...")

        db.execute(text("""
            CREATE TABLE IF NOT EXISTS local_population_grid (
                id SERIAL PRIMARY KEY,
                pop_count INTEGER NOT NULL,
                geom GEOMETRY(Polygon, 4326) NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_population_grid_geom ON local_population_grid USING gist (geom);
        """))

        # Check existing count
        count = db.execute(text("SELECT count(*) FROM local_population_grid;")).scalar()
        if count == 0:
            print("Populating sample high-density polygons for testing...")
            # Insert sample grid polygons around major test cities (Delhi, Mumbai, Bengaluru)
            # 1. Delhi central grid (pop: 35,000)
            db.execute(text("""
                INSERT INTO local_population_grid (pop_count, geom)
                VALUES (35000, ST_MakeEnvelope(77.2000, 28.6050, 77.2180, 28.6250, 4326));
            """))

            # 2. Mumbai South grid (pop: 48,000)
            db.execute(text("""
                INSERT INTO local_population_grid (pop_count, geom)
                VALUES (48000, ST_MakeEnvelope(72.8200, 18.9200, 72.8450, 18.9450, 4326));
            """))

            # 3. Bengaluru central grid (pop: 28,000)
            db.execute(text("""
                INSERT INTO local_population_grid (pop_count, geom)
                VALUES (28000, ST_MakeEnvelope(77.5850, 12.9650, 77.6050, 12.9850, 4326));
            """))

            db.commit()
            print("Inserted 3 sample municipal population grids.")
        else:
            print(f"local_population_grid already contains {count} records.")

        print("Local population dataset setup complete!")
    except Exception as e:
        db.rollback()
        print(f"Failed to setup population dataset: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    setup_local_population_grid()
