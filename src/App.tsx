/* eslint-disable no-case-declarations */
/* eslint-disable no-fallthrough */
import { useEffect, useRef } from "react";
import "./workflows-element.js";
import "./App.css";
import { NotificationRecipientTypesEnum } from "./NotificationRecipientTypesEnum.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace React.JSX {
    interface IntrinsicElements {
      "sourceloop-workflow-element": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

function App() {
  const workflowRef = useRef(null);

  useEffect(() => {
    const { current: element } = workflowRef;
    let selectedColumnType: any;

    const FIELD_VALUES: Record<
      string,
      {
        valueInputType: string;
        values?: { text: string; value: string }[];
      }
    > = {
      status: {
        valueInputType: "list",
        values: [
          { text: "Todo", value: "todo" },
          { text: "In Progress", value: "in_progress" },
        ],
      },
      priority: {
        valueInputType: "list",
        values: [
          { text: "Critical", value: "critical" },
          { text: "High", value: "high" },
          { text: "Medium", value: "medium" },
          { text: "Low", value: "low" },
        ],
      },
      date: {
        valueInputType: "date",
      },
      datetime: {
        valueInputType: "datetime",
      },
      people: {
        valueInputType: "people",
      },
      text: {
        valueInputType: "text",
      },
      number: {
        valueInputType: "number",
      },
    };

    element.allColumns = [
      {
        text: "Status",
        value: "{{Status}}",
      },
      {
        text: "People",
        value: "{{People}}",
      },
      {
        text: "Text",
        value: "{{Text}}",
      },
    ];

    const NORMALIZED_COLUMN = [
      {
        text: "Status",
        value: "1952177d-9a3e-6ef4-ae8f-522c08153026",
      },
      {
        text: "Priority",
        value: "1952177d-9a3e-6ef4-ae8f-522c08153026",
      },
      {
        text: "Text",
        value: "2069d144-db46-0737-2c9d-bc339949d684",
      },
    ];

    const DATE_CONDITIONS = [
      { text: "Past Today", value: "pastToday" },
      { text: "Coming In", value: "comingIn" },
      { text: "Past by", value: "pastby" },
    ];

    const CONDITIONS = {
      date: DATE_CONDITIONS,
      datetime: DATE_CONDITIONS,
    };

    const TIMESCALE = [
      { text: "Days", value: "D", timescale: "" },
      { text: "Hours", value: "H", timescale: "T" },
      { text: "Seconds", value: "S", timescale: "T" },
    ];

    const DEFAULT_CONDITION = [
      { text: "Equal", value: "equal" },
      { text: "Not Equal", value: "notequal" },
    ];

    element.addEventListener("diagramChange", (event) => {
      const diagram = event.detail;
    });
    element.addEventListener("eventAdded", (event) => {
      elementClick(event.detail);
    });
    element.addEventListener("actionAdded", (event) => {
      elementClick(event.detail);
    });
    element.addEventListener("itemChanged", (event) => {
      valueChanges(event.detail);
    });

    function elementClick(event) {
      const selectedElement = event.event ?? event.action;
      switch (selectedElement.getIdentifier()) {
        case "OnIntervalEvent":
          selectedElement.state.change("intervalList", TIMESCALE);
          selectedElement.state.change("valuePlaceholder", "n");
        case "OnChangeEvent":
        case "OnValueEvent":
        case "ChangeColumnValueAction":
          selectedElement.state.change("columns", NORMALIZED_COLUMN);
          break;
      }
    }

    function valueChanges(event) {
      console.log("event field: ", event.field);
      console.log("FIELD_VALUES: ", FIELD_VALUES);
      let selectedCol;

      switch (event.field) {
        case "ValueInput":
          if (event.item.getIdentifier() === "OnIntervalEvent") {
            event.item.state.change("intervalList", TIMESCALE);
            return;
          }
          break;
        case "IntervalInput":
          const timescale = TIMESCALE.find(
            (time) => time.value === event.value
          )?.timescale;
          event.item.state.change("timescale", timescale);
          break;
        case "TriggerColumnInput":

        case "ColumnInput":
          selectedCol = NORMALIZED_COLUMN.find(
            (col) => col.value === event.value
          );
          selectedColumnType = selectedCol.text?.toLowerCase();
          const condition =
            CONDITIONS[selectedCol.text?.toLowerCase()] || DEFAULT_CONDITION;
          if (selectedCol) {
            event.item.state.change("conditions", condition);
          }
        case "ConditionInput":
        case "ToColumnInput":
          selectedCol = NORMALIZED_COLUMN.find(
            (col) => col.value === event.value
          );
          if (selectedCol) selectedColumnType = selectedCol.text?.toLowerCase();
          event.item.state.change(
            "valueInputType",
            FIELD_VALUES[selectedColumnType].valueInputType
          );
          if (FIELD_VALUES[selectedColumnType].values) {
            event.item.state.change(
              "values",
              FIELD_VALUES[selectedColumnType].values
            );
          }

          break;
        case "EmailDataInput":
          const notify = [
            {
              text: WORKFLOW_CONST.notifyMeLBl,
              value: NotificationRecipientTypesEnum.NotifyMe,
            },
            {
              text: WORKFLOW_CONST.notifyEveryoneOnTheProjectLbl,
              value: NotificationRecipientTypesEnum.NotifyEveryoneOnProject,
            },
            {
              text: WORKFLOW_CONST.notifyProjectOwnersLbl,
              value: NotificationRecipientTypesEnum.NotifyProjectOwners,
            },
            {
              text: WORKFLOW_CONST.notifySpecificPeopleLbl,
              value: NotificationRecipientTypesEnum.NotifySpecificPeople,
            },
            {
              text: WORKFLOW_CONST.notifySpecificColumn,
              value: NotificationRecipientTypesEnum.NotifySpecificColumn,
            },
          ];
          event.item.state.change("emailToInputType", InputTypes.List);
          event.item.state.change("emailToValues", notify);
          if (event.value) {
            event.item.state.change("subject", event.value.subject);
            event.item.state.change("body", event.value.body);
          }
          break;
        case "EmailToInput": {
          // performSelectNotifRecipient(event);
          event.item.state.change("recipientType", event.value);
          break;
        }
        case "EmailRecepientInput":
          if (
            event.item.state.get("emailTo") !==
            NotificationRecipientTypesEnum.NotifySpecificColumn
          ) {
            event.item.state.change("recipients", event.value?.ids);
          } else {
            event.item.state.change("peopleColumnId", event.value);
          }
          break;
      }
    }

    console.log(element);
  }, []);

  return (
    <sourceloop-workflow-element
      ref={workflowRef}
    ></sourceloop-workflow-element>
  );
}

export default App;
