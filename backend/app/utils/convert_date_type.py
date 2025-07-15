import datetime

def convert_datetime_fields(data):
    """Chuyển đổi datetime, date, và timedelta thành string để JSON serialize được"""
    if isinstance(data, list):
        # Nếu là list, xử lý từng item
        for item in data:
            convert_datetime_fields(item)
    elif isinstance(data, dict):
        # Nếu là dict, xử lý từng key-value
        for key, value in data.items():
            if isinstance(value, datetime.timedelta):
                # Chuyển timedelta thành string HH:MM:SS
                total_seconds = int(value.total_seconds())
                hours = total_seconds // 3600
                minutes = (total_seconds % 3600) // 60
                seconds = total_seconds % 60
                data[key] = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
            elif isinstance(value, datetime.datetime):
                # Chuyển datetime thành string
                data[key] = value.isoformat()
            elif isinstance(value, datetime.date):
                # Chuyển date thành string
                data[key] = value.isoformat()
    return data