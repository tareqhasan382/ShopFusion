import React from 'react';

const FormateDate = ({date}) => {
   // console.log("date:",date)
    const createdAt = new Date(date);
const day = createdAt.getDate();
const month = createdAt.toLocaleString('default', { month: 'long' });
const year = createdAt.getFullYear();
  return (
    <div>
      <p>{`${day} ${month} ${year}`}</p>
    </div>
  );
}

export default FormateDate;