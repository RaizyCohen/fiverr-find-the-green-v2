import React from 'react';
import AvocadoIcon from '@iconify-icons/openmoji/avocado';
import {Icon} from '@iconify/react';

const AdaptedAvocadoIcon = ({ size = 40, rotation = 0, className = '', style = {} }) => {
  return (
    <Icon
      icon={AvocadoIcon}
      style={{
        width: size,
        height: size,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: '50% 50%',
        pointerEvents: 'none',  // prevent interaction if you want
        ...style,
      }}
      className={className}
    />
  );
};

export {AdaptedAvocadoIcon}
