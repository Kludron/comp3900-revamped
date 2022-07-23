from urllib import response
import requests
import json

class Client:

    def __init__(self) -> None:
        self.url = "https://api.nal.usda.gov/fdc/v1/foods/"
        self.key = "7BLf7g2usJqtbRTKHTWWE7XbXa8wnoBaeLUn6ZnA"

    def __call(self, params, suffix):
        target_url = self.url + suffix
        call_params = dict(params, api_key=self.key)
        response = json.loads(requests.get(url=target_url, params=call_params).text)
        return response

    def search(self, name):
        params = dict(
            query=name,
            ds='Standard Reference',
            format='json'
        )
        print(params)
        result = search_parse(self.__call(params,'/search'))

        return result if result else None

def search_parse(search_results):
    """ Return a simplified version of the json object returned from the USDA API.
    This deletes extraneous pieces of information that are not important for providing
    context on the search results.
    """
    if 'errors' in search_results.keys():
        return None
    # Store the search term that was used to produce these results
    # search_term = search_results["list"]["q"]
    # print([a["nutrientName"] for a in search_results["foods"][0]["foodNutrients"]])
    print([f["nutrientName"] for f in search_results["foods"][0]["foodNutrients"]])
    return
    # Store a list of dictionary items for each result of the search
    items = []
    for item in search_results["list"]["item"]:
        # Remove extraneous pieces of data
        del item["ds"]; del item["manu"]; del item["offset"]
        items.append(item)
    return dict(search_term=search_term, items=items)

