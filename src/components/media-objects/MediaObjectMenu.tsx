import * as React from 'react';
import { Sidebar, List, Segment, Button, Icon, Grid, Input, Ref } from 'semantic-ui-react';
import { RouteComponentProps, withRouter } from "react-router-dom";

import useShortcuts from 'hooks/useShortcuts';

import { IMediaObject, IMediaObjectType } from 'models';

import "./Hover.css";

import ConfirmDialog, { IConfirmDialogProps } from "components/high-order/confirm-dialog";

interface IMediaObjectMenuProps extends RouteComponentProps {
    mediaObjects: IMediaObject[];
    selectedMediaObjectId: string;
    setSelectedMediaObject(id: string): void;
    editMediaObject(mediaObjects: Map<string, IMediaObject>): void
    deleteMediaObject(mediaObjects: Map<string, IMediaObject>): void;
}

const MediaObjectMenu: React.FC<IMediaObjectMenuProps> = ({ mediaObjects, selectedMediaObjectId, setSelectedMediaObject }) => {

    const [editField, setEditField] = React.useState("");
    const [editFieldValue, setEditFieldValue] = React.useState("");
    const [dialog, confirm] = React.useState<IConfirmDialogProps>();
    const [mediaObject, updateMediaObject] = React.useState<IMediaObject>();

    React.useEffect(() => {
        document.addEventListener("mousedown", handleClick);
        return () => {
            document.removeEventListener("mousedown", handleClick);
        };
    }, []);

    const menuSelection = React.useRef<HTMLInputElement | null>(null);

    const handleClick = (e: any) => {
        if (menuSelection && menuSelection.current) {
            if (menuSelection.current.contains(e.target)) {
                return;
            }
        }
        setEditField("");
        // editMediaObject(new Map([...mediaObjects]);
    };

    const editButtonHandler = React.useCallback(
        (id, value) => {
            setEditField(id)
            setEditFieldValue(value)
        }, [])

    const deleteButtonHandler = React.useCallback((mediaObject) => {
        confirm({
            message: "Are you sure you want to delete " + mediaObject.name + "?",
            confirmAction: () => {
                console.log("delete " + mediaObject.name);
                // deleteMediaObject(new Map([...mediaObjects]);
                confirm(undefined);
            },
            cancelAction: () => {
                confirm(undefined);
            },
        });
    }, []);

    const confirmButtonHandler = React.useCallback(() => {
        setEditField("");
    }, [])

    const getSelectedDirectory: () => string = () => {
        const selectedMediaObject = mediaObjects.find(o => o.id === selectedMediaObjectId);
        if (selectedMediaObject) {
            if (selectedMediaObject.objectType === IMediaObjectType.FILE) {
                return selectedMediaObject.parentId || selectedMediaObjectId;
            }
        }
        return selectedMediaObjectId;
    }

    const rootDir = ([] as IMediaObject[]).concat(mediaObjects).find(dir => (dir.objectType === IMediaObjectType.DIRECTORY) && !dir.parentId)

    const getSubDirectories = (mediaObject: IMediaObject) => {
        const childItems = mediaObjects.filter(dir => (dir.objectType === IMediaObjectType.DIRECTORY) && dir.parentId === mediaObject.id);
        const isSelected = mediaObject.id === getSelectedDirectory();
        return (
            <List.Item key={mediaObject.id} >
                <List.Icon name={isSelected ? "folder open" : "folder"} onClick={() => setSelectedMediaObject(mediaObject.id)} />
                <List.Content >
                    <Grid className="parent" columns="equal" verticalAlign='middle' style={{ margin: "-3px" }}>
                        <Grid.Column style={{ padding: "3px" }}>
                            <List.Header>
                                {editField === mediaObject.id ?
                                    <Ref innerRef={menuSelection}>
                                        <Input className='bold' autoFocus transparent fluid value={editFieldValue}
                                            onChange={(e) => { setEditFieldValue(e.target.value) }}
                                            onKeyPress={(e: any) => { if (e.key === 'Enter') { setEditField("") } }}
                                        />
                                    </Ref> : <div onClick={() => setSelectedMediaObject(mediaObject.id)} >{mediaObject.name}</div>}
                            </List.Header>
                        </Grid.Column>
                        <Grid.Column className="child" verticalAlign='middle' style={{ flex: "0 0 auto", width: "auto", padding: "3px" }}>
                            {!(editField === mediaObject.id) ?
                                <>
                                    <Icon name='edit' style={{ cursor: "pointer", fontSize: "inherit" }} onClick={() => editButtonHandler(mediaObject.id, mediaObject.name)} />
                                    <Icon name='delete' style={{ cursor: "pointer", fontSize: "inherit", margin: 0 }} onClick={() => deleteButtonHandler(mediaObject)} />
                                </> : null}
                        </Grid.Column>
                    </Grid>
                    {childItems.length > 0 && <List.List style={{ width: "100%" }}>
                        {childItems.map((dir) => getSubDirectories(dir))}
                    </List.List>}
                </List.Content>
            </List.Item>);
    }

    return (
        <>
            {dialog && <ConfirmDialog {...dialog} />}
            <Sidebar visible={true}>
                <Segment circular={false}>
                    {rootDir &&
                        <List>
                            {
                                ([] as IMediaObject[]).concat(mediaObjects).filter(dir => (dir.objectType === IMediaObjectType.DIRECTORY) && dir.parentId === rootDir.id).map((dir) => getSubDirectories(dir))
                            }
                        </List>}
                </Segment>
            </Sidebar>
        </>
    )
}


export default withRouter(MediaObjectMenu);