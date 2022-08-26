export const Video: React.FC<{ embedId: string; width: number; height: number }> = (props) => {
  return (
    <div className=" pointer-events-none ">
      <iframe
        className=" pointer-events-auto"
        width={props.width}
        height={props.height * 1.25}
        src={`https://www.youtube.com/embed/${props.embedId}?rel=0&modestbranding=1&autohide=1&showinfo=0&controls=0`}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        aria-controls="0"
        allowFullScreen
      />
    </div>
  );
};
