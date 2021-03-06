import {O} from "vwebapp-framework";
import {store} from "Store";
import {StoreAccessor} from "mobx-firelink";
import {GetMap} from "@debate-map/server-link/Source/Link";

export class PrivatePageState {
	@O listType = "featured" as "featured" | "all";
	@O selectedMapID: string;
}

export const GetSelectedPrivateMap = StoreAccessor(s=>()=>{
	const selectedID = store.main.private.selectedMapID;
	// return GetData(`maps/${selectedID}`);
	// return (GetMapsOfType(MapType.Personal) || []).find(a=>a._id == selectedID);
	return GetMap(selectedID);
});