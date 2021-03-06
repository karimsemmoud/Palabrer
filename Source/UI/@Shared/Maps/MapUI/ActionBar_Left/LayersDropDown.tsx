import {E} from "js-vextensions";
import {Button, CheckBox, Column, DropDown, DropDownContent, DropDownTrigger, Row} from "react-vcomponents";
import {BaseComponentPlus} from "react-vextensions";
import {ShowMessageBox} from "react-vmessagebox";
import {ScrollView} from "react-vscrollview";
import {MeID, GetUser} from "@debate-map/server-link/Source/Link";
import {GetLayers, ForDeleteLayer_GetError, GetMapLayerIDs} from "@debate-map/server-link/Source/Link";
import {IsUserCreatorOrMod} from "@debate-map/server-link/Source/Link";
import {ShowSignInPopup} from "UI/@Shared/NavBar/UserPanel";
import {Layer} from "@debate-map/server-link/Source/Link";
import {GetUserLayerStateForMap} from "@debate-map/server-link/Source/Link";
import {DeleteLayer} from "@debate-map/server-link/Source/Link";
import {SetLayerAttachedToMap} from "@debate-map/server-link/Source/Link";
import {SetMapLayerStateForUser} from "@debate-map/server-link/Source/Link";
import {Map} from "@debate-map/server-link/Source/Link";
import {ShowAddLayerDialog} from "../../Layers/AddLayerDialog";
import {ES} from "../../../../../Utils/UI/GlobalStyles";

export const columnWidths = [0.5, 0.3, 0.1, 0.1];

type LayersDropDownProps = {map: Map};
class LayersDropDown extends BaseComponentPlus({} as LayersDropDownProps, {}) {
	render() {
		const {map} = this.props;
		const userID = MeID();
		const layers = GetLayers();
		const creatorOrMod = IsUserCreatorOrMod(userID, map);
		return (
			<DropDown>
				<DropDownTrigger><Button ml={5} text="Layers"/></DropDownTrigger>
				<DropDownContent style={{left: 0, padding: null, background: null, borderRadius: null}}>
					<Row style={{alignItems: "flex-start"}}>
						<Column style={{width: 600}}>
							<Column className="clickThrough" style={{height: 80, background: "rgba(0,0,0,.7)" /* borderRadius: "10px 10px 0 0" */, maxHeight: 320}}>
								<Row style={{height: 40, padding: 10}}>
									{/* <Row width={200} style={{position: "absolute", left: "calc(50% - 100px)"}}>
										<Button text={<Icon icon="arrow-left" size={15}/>} title="Previous page"
											enabled={page > 0} onClick={()=> {
												//store.dispatch(new ACTMapNodeListPageSet({mapID: map._id, page: page - 1}));
												store.dispatch(new ACTMapNodeListPageSet({mapID: map._id, page: page - 1}));
											}}/>
										<Div ml={10} mr={7}>Page: </Div>
										<TextInput mr={10} pattern="[0-9]+" style={{width: 30}} value={page + 1}
											onChange={val=> {
												if (!IsNumberString(val)) return;
												store.dispatch(new ACTMapNodeListPageSet({mapID: map._id, page: (parseInt(val) - 1).KeepBetween(0, lastPage)}))
											}}/>
										<Button text={<Icon icon="arrow-right" size={15}/>} title="Next page"
											enabled={page < lastPage} onClick={()=> {
												store.dispatch(new ACTMapNodeListPageSet({mapID: map._id, page: page + 1}));
											}}/>
									</Row>
									<Div mlr="auto"/>
									<Pre>Filter:</Pre>
									<InfoButton text="Hides nodes without the given text. Regular expressions can be used, ex: /there are [0-9]+ dimensions/"/>
									<TextInput ml={2} value={filter} onChange={val=>store.dispatch(new ACTMapNodeListFilterSet({mapID: map._id, filter: val}))}/> */}
									<Button ml="auto" text="Add layer" onClick={()=>{
										if (userID == null) return ShowSignInPopup();
										ShowAddLayerDialog(userID);
									}}/>
								</Row>
								<Row style={{position: "relative", height: 40, padding: 10}}>
									<span style={{position: "absolute", right: 27, top: 3, fontSize: 13}}>Enabled for...</span>
									<span style={{flex: columnWidths[0], fontWeight: 500, fontSize: 17}}>Title</span>
									<span style={{flex: columnWidths[1], fontWeight: 500, fontSize: 17}}>Creator</span>
									<span style={{flex: columnWidths[2], marginTop: 15, fontWeight: 500, fontSize: 15}}>Map</span>
									<span style={{flex: columnWidths[3], marginTop: 15, fontWeight: 500, fontSize: 15}}>User</span>
								</Row>
							</Column>
							<ScrollView style={ES({flex: 1})} contentStyle={ES({flex: 1, position: "relative"})}>
								{layers.length == 0 && <div style={{textAlign: "center", fontSize: 18}}>Loading...</div>}
								{layers.map((layer, index)=><LayerUI key={layer._key} index={index} last={index == layers.length - 1} map={map} layer={layer}/>)}
							</ScrollView>
						</Column>
						{false &&
							<Column style={{width: 400}}>
							</Column>}
					</Row>
				</DropDownContent>
			</DropDown>
		);
	}
}

class LayerUI extends BaseComponentPlus({} as {index: number, last: boolean, map: Map, layer: Layer}, {}) {
	render() {
		const {index, last, map, layer} = this.props;
		const userID = MeID();
		// const creator = GetUser({if: layer}, layer.creator); // todo
		const creator = GetUser(layer ? layer.creator : null);
		const userLayerState = GetUserLayerStateForMap(userID, map._key, layer._key);
		const creatorOrMod = IsUserCreatorOrMod(userID, map);
		const deleteLayerError = ForDeleteLayer_GetError(userID, layer);
		return (
			<Column p="7px 10px" style={E(
				{background: index % 2 == 0 ? "rgba(30,30,30,.7)" : "rgba(0,0,0,.7)"},
				last && {borderRadius: "0 0 10px 10px"},
			)}>
				<Row>
					<span style={{flex: columnWidths[0]}}>
						{layer.name}
						{creator && creator._key == MeID() &&
							<Button text="X" ml={5} style={{padding: "3px 5px"}} enabled={deleteLayerError == null} title={deleteLayerError}
								onClick={()=>{
									ShowMessageBox({
										title: `Delete "${layer.name}"`, cancelButton: true,
										message: `Delete the layer "${layer.name}"?`,
										onOK: async()=>{
											new DeleteLayer({layerID: layer._key}).Run();
										},
									});
								}}/>}
					</span>
					<span style={{flex: columnWidths[1]}}>{creator ? creator.displayName : "..."}</span>
					<span style={{flex: columnWidths[2]}}>
						<CheckBox enabled={creatorOrMod} value={GetMapLayerIDs(map._key).Contains(layer._key)} onChange={val=>{
							new SetLayerAttachedToMap({mapID: map._key, layerID: layer._key, attached: val}).Run();
						}}/>
					</span>
					<span style={{flex: columnWidths[3]}}>
						<CheckBox value={userLayerState} indeterminate={userLayerState == null} onChange={val=>{
							if (MeID() == null) return ShowSignInPopup();
							const newState =								userLayerState == null ? true
								: userLayerState == true ? false
								: null;
							new SetMapLayerStateForUser({userID: MeID(), mapID: map._key, layerID: layer._key, state: newState}).Run();
						}}/>
					</span>
				</Row>
			</Column>
		);
	}
}