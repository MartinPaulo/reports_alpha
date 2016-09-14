import logging
from datetime import date

from scripts.cloud.utility import date_range


def build_top_twenty(extract_db, load_db, start_day=None,
                     end_day=date.today()):
    if not start_day:
        start_day = load_db.get_top_twenty_last_run_date()
    logging.info("Building top twenty data from %s till %s", start_day,
                 end_day)
    for day_date in date_range(start_day, end_day):
        logging.info("Building top twenty data for %s", day_date)
        result_set = extract_db.get_top_twenty_projects(day_date)
        for row in result_set:
            user_counts = {
                'date': row["date"],
                'project_id': row["project_id"],
                'vcpus': int(row["vcpus"]),
                'tenant_name': row["tenant_name"]
            }
            load_db.save_top_twenty_data(user_counts)