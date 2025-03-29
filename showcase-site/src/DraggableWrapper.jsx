import { useDrag } from 'react-dnd';

const DraggableWrapper = ({ children, type, itemData, moveType = 'clone' }) => {
    const componentType = children?.type?.displayName ||
                         children?.type?.name ||
                         'UnknownComponent';
   
    // Serialize component props, filtering out functions and complex objects
    const serializableProps = Object.entries(children.props).reduce((acc, [key, value]) => {
        if (typeof value !== 'function' && typeof value !== 'object') {
            acc[key] = value;
        }
        return acc;
    }, {});

    const [{ isDragging }, drag] = useDrag({
        type: type,
        item: {
            ...itemData,
            component: children.type,
            componentType: componentType || children.type.name.toLowerCase(),
            props: serializableProps,
            moveType,
            originalProps: children.props // Keep original props for reference
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    return (
        <div
            style={{
                position: 'relative',
                width: 'fit-content',
                height: 'fit-content',
                display: (isDragging && moveType === 'move') ? 'none' : 'block',
                boxSizing: 'border-box',
                overflow: 'visible',
                flex: 'none',
            }}
        >
            {/* Drag handle tab */}
            <div
                ref={drag}
                style={{
                    position: 'absolute',
                    top: '-16px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '40px',
                    height: '16px',
                    backgroundColor: '#e2e8f0',
                    borderTopLeftRadius: '4px',
                    borderTopRightRadius: '4px',
                    cursor: 'move',
                    opacity: isDragging ? 0.5 : 1,
                    zIndex: 10,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '10px',
                    border: '1px solid #cbd5e0',
                    borderBottom: 'none',
                    boxShadow: '0 -1px 2px rgba(0,0,0,0.05)'
                }}
            >
                <span style={{ pointerEvents: 'none' }}>•••</span>
            </div>
            
            {/* Actual component wrapper */}
            <div style={{
                position: 'relative',
                boxSizing: 'border-box',
                width: 'fit-content',
                height: 'fit-content',
                overflow: 'visible',
            }}>
                {children}
            </div>
        </div>
    );
};

export default DraggableWrapper;