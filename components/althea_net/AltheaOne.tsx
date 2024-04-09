// AltheaOne SVG icon component
interface Props {
  theme: string;
}

export const AltheaOne = ({ theme }: Props) => {
  return (
    <svg
      id="althea-one"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 19.84 26.02"
    >
      <g id="group">
        <polygon
          fill={theme == "white" ? "#fff" : "#07f"}
          points="6.45 0 0 7.68 3.06 10.25 8.73 3.54 9.06 3.54 9.06 21.66 1.9 21.66 1.9 26.02 19.84 26.02 19.84 21.66 13.87 21.66 13.87 0 6.45 0"
        />
      </g>
    </svg>
  );
};
