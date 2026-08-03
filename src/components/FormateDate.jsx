const FormateDate = ({ date }) => {
  const createdAt = new Date(date);
  if (isNaN(createdAt.getTime())) return <span>—</span>;

  return (
    <span className="whitespace-nowrap">
      {createdAt.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })}
    </span>
  );
};

export default FormateDate;
