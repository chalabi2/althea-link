import LoadingComponent from "../animated/loader";
import Image from "next/image";
const loadingGif = "/loading.gif";
import Icon from "./icon";

interface Props {
  status: "NONE" | "POPULATING" | "PENDING" | "SIGNING" | "SUCCESS" | "ERROR";
  color?: "primary" | "accent" | "dark";
  className?: string;
  size?: number;
}

const StatusIcon = (props: Props) => {
  if (["PENDING", "SIGNING", "POPULATING", "NONE"].includes(props.status))
    return <Image alt="Loading icon" src={loadingGif} height={50} width={50} />;
  return (
    <Icon
      themed
      icon={{
        url:
          props.status === "SUCCESS"
            ? "/check.svg"
            : props.status === "ERROR"
              ? "/close.svg"
              : "",
        size: props.size,
      }}
      className={props.className}
      color={props.color}
    />
  );
};
export default StatusIcon;
