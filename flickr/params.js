import { DAY_IN_MONTHS } from './months';

export function getDefaultRequestParams(year, month, startDay, endDay, box, page = 1) {
    return {
        'extras': 'description, date_upload, date_taken, owner_name, geo, tags, url_o',
        'min_upload_date': `${year}-${month}-${startDay} 00:00:00`,
        'max_upload_date': `${year}-${month}-${endDay} 24:00:00`,
        'bbox': box.getString(),
        'accuracy': 16,
        'per_page': 500,
        'page': page
    }
}