import { CustomLink } from "@/customization/components/custom-link";
import { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import IconComponent from "../../../../components/common/genericIconComponent";
import { SingleAlertComponentType } from "@/types/alerts";
import { useEffect } from "react";
import Loading from "@/components/ui/loading";
import ShadTooltip from "../../../../components/common/shadTooltipComponent";
import useAlertStore from "@/stores/alertStore";
import {cloneDeep} from "lodash";
import useFlowStore from "@/stores/flowStore";
import axios from "axios";

export default function SingleAlert({
                                      dropItem,
                                      removeAlert,
                                    }: SingleAlertComponentType): JSX.Element {
  const calculateProgress = () => {
    if (!dropItem.starttime) return 0;
    const elapsedTime = Date.now() - dropItem.starttime;
    const duration = 90000;
    return Math.min((elapsedTime / duration) * 99, 99);
  };
  const [show, setShow] = useState(true);
  const [progress, setProgress] = useState(calculateProgress()|| 0);
  const type = dropItem.type;
  const setSuccessData = useAlertStore((state) => state.setSuccessData);
  const setErrorData = useAlertStore((state) => state.setErrorData);
  const currentFlow = useFlowStore((state) => state.currentFlow);


  useEffect(() => {
    if (type === "progress") {
      const interval = setInterval(() => {
        setProgress((prevProgress) => {
          if (dropItem && prevProgress >= 99) {
            const healthUrl = `${dropItem.returnUrl}/health`;
            const checkRevision = () => {
              axios.get(healthUrl)
                  .then((response) => {
                    if (response.status === 200) {
                      const fetchedRevision = response.data.revision;
                      if (fetchedRevision !== dropItem.revision) {
                        setShow(false);
                        removeAlert(dropItem.id);
                        clearInterval(interval);
                        setSuccessData({ title: `${dropItem.name} Deployed Successfully.`, returnUrl: dropItem.returnUrl });
                      }
                    }
                  })
                  .catch((err) => {
                    console.log("Health check failed", err);
                  });
            };
            checkRevision();
            return 99;
          }
          return calculateProgress();
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [type]);


  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setSuccessData({ title: "URL copied to clipboard." });
    }).catch((err) => {
      setErrorData({ title: "Failed to copy URL." });
      console.error("Failed to copy URL:", err);
    });
  };

  return type === "error" ? (
    <div
      className="mx-2 mb-2 flex rounded-md bg-error-background p-3"
      key={dropItem.id}
    >
      <div className="flex-shrink-0">
        <IconComponent
          name="XCircle"
          className="h-5 w-5 text-status-red"
          aria-hidden="true"
        />
      </div>
      <div className="ml-3">
        <h3 className="text-sm font-medium text-error-foreground word-break-break-word">
          {dropItem.title}
        </h3>

        {dropItem.list ? (
          <div className="mt-2 text-sm text-error-foreground">
            <ul className="list-disc space-y-1 pl-5">
              {dropItem.list.map((item, idx) => (
                <li className="word-break-break-word" key={idx}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <></>
        )}
      </div>
      <div className="ml-auto pl-3">
        <div className="-mx-1.5 -my-1.5">
          <button
            type="button"
            onClick={() => {
              setShow(false);
              setTimeout(() => {
                removeAlert(dropItem.id);
              }, 500);
            }}
            className="inline-flex rounded-md p-1.5 text-status-red"
          >
            <span className="sr-only">Dismiss</span>
            <IconComponent
              name="X"
              className="h-4 w-4 text-error-foreground"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </div>
  ) : type === "notice" ? (
    <div
      className="mx-2 mb-2 flex rounded-md bg-info-background p-3"
      key={dropItem.id}
    >
      <div className="flex-shrink-0 cursor-help">
        <IconComponent
          name="Info"
          className="h-5 w-5 text-status-blue"
          aria-hidden="true"
        />
      </div>
      <div className="ml-3 flex-1 md:flex md:justify-between">
        <p className="text-sm font-medium text-info-foreground">
          {dropItem.title}
        </p>
        <p className="mt-3 text-sm md:ml-6 md:mt-0">
          {dropItem.link ? (
            <CustomLink
              to={dropItem.link}
              className="whitespace-nowrap font-medium text-info-foreground hover:text-accent-foreground"
            >
              Details
            </CustomLink>
          ) : (
            <></>
          )}
        </p>
      </div>
      <div className="ml-auto pl-3">
        <div className="-mx-1.5 -my-1.5">
          <button
            type="button"
            onClick={() => {
              setShow(false);
              setTimeout(() => {
                removeAlert(dropItem.id);
              }, 500);
            }}
            className="inline-flex rounded-md p-1.5 text-info-foreground"
          >
            <span className="sr-only">Dismiss</span>
            <IconComponent
              name="X"
              className="h-4 w-4 text-info-foreground"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </div>
  ) : type === "progress" ? (
    <div className="mx-2 mb-2 flex rounded-md bg-gray-100/80 p-3 dark:bg-gray-800" key={dropItem.id}>
      <div className="flex-shrink-0">
        <Loading data-testid="loading_icon" className="ml-0.5" size={16} />
      </div>
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium text-progress-foreground dark:text-white">
          {dropItem.title}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex h-2.5 w-full items-center justify-between rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-2.5 animate-pulse rounded-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm font-medium text-progress-foreground ml-2 dark:text-white">
            {progress.toFixed(0)}%
          </p>
        </div>
      </div>
    </div>
  ) : (
    <div
      className="mx-2 mb-2 flex rounded-md bg-success-background p-3"
      key={dropItem.id}
    >
      <div className="flex-shrink-0">
        <IconComponent
          name="CheckCircle2"
          className="h-5 w-5 text-status-green"
          aria-hidden="true"
        />
      </div>
      <div className="ml-3">
        <p className="text-sm font-medium text-success-foreground">
          {dropItem.title}
          {dropItem.returnUrl && <br />}
          {dropItem.returnUrl && (
            <div className="flex items-center space-x-2">
              <a
                href={dropItem.returnUrl}
                className="text-blue-500"
                target="_blank"
                rel="noopener noreferrer"
              >
                {dropItem.returnUrl}
              </a>
              <ShadTooltip content="Copy" side="top" styleClasses="z-999">
                <button
                  onClick={() => copyToClipboard(dropItem.returnUrl)}
                  className="text-blue-500 underline"
                >
                  <IconComponent
                    name="Copy"
                    className="side-bar-button-size h-5 w-5 text-black hover:text-blue-600 dark:text-white"
                    aria-hidden="true"
                  />
                </button>
              </ShadTooltip>
            </div>
          )}
        </p>
      </div>
      <div className="ml-auto pl-3">
        <div className="-mx-1.5 -my-1.5">
          <button
            type="button"
            onClick={() => {
              setShow(false);
              setTimeout(() => {
                removeAlert(dropItem.id);
              }, 500);
            }}
            className="inline-flex rounded-md p-1.5 text-status-green"
          >
            <span className="sr-only">Dismiss</span>
            <IconComponent
              name="X"
              className="h-4 w-4 text-success-foreground"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
