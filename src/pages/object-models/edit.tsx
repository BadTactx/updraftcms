import React from "react";
import { useParams, useHistory } from "react-router";
import { useDispatch, useSelector } from "react-redux";

import guid from "uuid/v4";

import { IAppState } from "store/State";
import { IObjectModel, FormErrors } from "models";
import { defaultObjectModel } from "store/State/IObjectModel";

import {
  SAVE_OBJECT_MODEL,
  DELETE_OBJECT_MODEL,
} from "store/actions/ObjectModel";

import useObjectModels from "hooks/useObjectModels";
import useShortcuts from "hooks/useShortcuts";
import Layout from "components/layout";
import ObjectModelEditToolbar from "components/object-models/object-model-edit-toolbar";
import ObjectModelEdit from "components/object-models/object-model-edit";
import ConfirmDialog, {
  IConfirmDialogProps,
} from "components/high-order/confirm-dialog";
import { Form } from "semantic-ui-react";
import ModalDialog from "components/high-order/modal-dialog/index";

interface IRouteParams {
  id: string;
}

export interface IGeneralSettingsTabState {
  deleteOpen: boolean;
  setDeleteOpen: boolean;
  objectModel: IObjectModel;
  errors: FormErrors;
  dirty: boolean;
  setDirty: boolean;
  cloneModalOpen: boolean;
  setcloneModalOpen: boolean;
}

const ObjectModelsEditPage: React.FC = () => {
  useObjectModels();

  const history = useHistory();
  const dispatch = useDispatch();
  const { id } = useParams<IRouteParams>();
  const { objectModels } = useSelector(
    (appState: IAppState) => appState.objectModel
  );
  const [objectModel, updateObjectModel] = React.useState<IObjectModel>(
    objectModels.get(id) || { ...defaultObjectModel, id }
  );

  const [dirty, setDirty] = React.useState(false);
  const [errors, updateErrors] = React.useState<FormErrors>({});

  const [cloneModalOpen, setCloneModalOpen] = React.useState(false);
  const [cloneName, setCloneName] = React.useState("");
  const [dialog, confirm] = React.useState<IConfirmDialogProps>();

  const closeObjectModel = React.useCallback(() => {
    history.push(`/object-models`);
  }, [history]);

  const saveObjectModel = React.useCallback(() => {
    if (objectModel.name === "") {
      updateErrors({ ...errors, name: "Name is a mandatory field" });
      return false;
    } else {
      dispatch({
        type: SAVE_OBJECT_MODEL,
        objectModels: objectModels.set(objectModel.id, objectModel),
        objectModel,
      });
      setDirty(false);
      return true;
    }
  }, [errors, updateErrors, dispatch, objectModels, objectModel]);

  const deleteObjectModel = React.useCallback(() => {
    objectModels.delete(objectModel.id);
    dispatch({
      type: DELETE_OBJECT_MODEL,
      objectModels,
      deletedObjectModel: objectModel,
    });
    closeObjectModel();
  }, [dispatch, objectModels, objectModel, closeObjectModel]);

  const cloneObjectModel = React.useCallback(
    (name) => {
      let id = guid().replace(/-/g, "");
      while (objectModels.get(id)) {
        id = guid().replace(/-/g, "");
      }
      const clonedObjectModel = {
        ...objectModel,
        id,
        name,
      };

      dispatch({
        type: SAVE_OBJECT_MODEL,
        objectModels: objectModels.set(id, clonedObjectModel),
        objectModel: clonedObjectModel,
      });

      history.push(`/object-models/${id}/edit`);
    },
    [dispatch, objectModels, objectModel, history]
  );

  React.useEffect(() => {
    if (id !== objectModel.id) {
      const om = objectModels.get(id);
      if (om) {
        updateObjectModel(om);
      }
    }
  }, [id, objectModels, objectModel]);

  const valueChangeHandler = React.useCallback(
    (updatedModel: IObjectModel) => {
      updateObjectModel(updatedModel);
      if (updatedModel.name !== "") {
        delete errors["name"];
      }
      updateErrors(errors);
      setDirty(true);
    },
    [errors, updateErrors, updateObjectModel]
  );

  const saveObjectModelHandler = React.useCallback(() => {
    if (saveObjectModel()) {
      closeObjectModel();
    }
  }, [saveObjectModel, closeObjectModel]);

  const cloneObjectModelHandler = React.useCallback(() => {
    setCloneModalOpen(true);
  }, [setCloneModalOpen]);

  const cloneCancelHandler = React.useCallback(() => {
    setCloneModalOpen(false);
    setCloneName("");
  }, [setCloneModalOpen, setCloneName]);

  const cloneSubmitHandler = React.useCallback(() => {
    if (saveObjectModel()) {
      let name = cloneName;
      cloneObjectModel(name);
    }
    setCloneModalOpen(false);
  }, [saveObjectModel, cloneName, cloneObjectModel, setCloneModalOpen]);

  const closeObjectModelHandler = React.useCallback(() => {
    if (dirty) {
      confirm({
        message: "Do you wish to save changes?",
        confirmText: "Save",
        confirmAction: saveObjectModelHandler,
        cancelText: "Discard",
        cancelAction: () => {
          closeObjectModel();
          confirm(undefined);
        },
      });
    } else closeObjectModel();
  }, [saveObjectModelHandler, closeObjectModel, dirty]);

  const deleteObjectModelHandler = React.useCallback(() => {
    confirm({
      message: "Are you sure you want to delete?",
      confirmAction: deleteObjectModel,
      cancelAction: () => confirm(undefined),
    });
  }, [deleteObjectModel, confirm]);

  useShortcuts([
    { key: "s", action: saveObjectModelHandler },
    { key: "d", action: deleteObjectModelHandler },
    { key: "q", action: closeObjectModelHandler },
    { key: "c", action: cloneObjectModelHandler },
  ]);

  return (
    <Layout>
      <ModalDialog
        modalOpen={cloneModalOpen}
        header="Clone Object Model"
        cancelAction={cloneCancelHandler}
        confirmAction={cloneSubmitHandler}
        confirmText="Confirm"
        cancelText="Cancel"
      >
        <Form.Input
          label="Name"
          name="name"
          value={cloneName}
          onChange={(e, { value }) => setCloneName(value)}
        />
      </ModalDialog>

      {dialog && <ConfirmDialog {...dialog} />}

      <ObjectModelEditToolbar
        isNew={objectModels.get(id) ? false : true}
        saveObjectModel={saveObjectModelHandler}
        cloneObjectModel={cloneObjectModelHandler}
        deleteObjectModel={deleteObjectModelHandler}
        closeObjectModel={closeObjectModelHandler}
      />
      <ObjectModelEdit
        errors={errors}
        onValueChange={valueChangeHandler}
        objectModel={objectModel}
      />
    </Layout>
  );
};

export default ObjectModelsEditPage;
